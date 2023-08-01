import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { generateCode } from 'src/core/utils';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { StatusEnum } from 'src/users/enums/status.enum';
import { CustomerOrder, CustomerOrderDoc } from './entities/customer-order.entity';
import { OrderStatusEnum } from './enums/order-status.enum';
import {
  WarehouseStockItems,
  WarehouseStockItemsDoc,
} from 'src/stock-item-data/entities/stock-item.entity';
import { ReleaseTransactionsService } from 'src/release-transactions/release-transactions.service';
import { RefundTransactionService } from 'src/refund-transaction/refund-transaction.service';
import { AddTransactionsService } from 'src/add-transactions/add-transactions.service';
import { ReturnMethodEnum } from './enums/return-method.enum';
import { StateMachineFactory } from '@buyby/state-machine';
import { OrderTransitionEnum } from './enums/order-transition.enum';
import { ORDER_STATUS } from './constants/order.constant';
import { Items } from 'src/audit-transactions/dto/audit-transactions.dto';
import { EntitiesService } from 'src/Entities/entity.service';
import { ServicesService } from 'src/services/services.service';
import { CouponService } from 'src/coupons/coupon.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderTypeEnum } from './enums/order-type.enum';
import { PaymentMethodEnum } from './enums/payment-method.enum';
import { concat } from 'rxjs';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { CartService } from 'src/cart/cart.service';
import { Order, OrderDoc } from 'src/order/entities/order.entity';
import { TableService } from 'src/tables/table.service';
import { OrderService } from 'src/order/order.service';
import { WarehouseManagementService } from 'src/warehouse-management/warehouse-management.service';

@Injectable()
export class CustomerOrderService extends BaseService<OrderDoc> {
  constructor(
    @InjectModel(Order.name) readonly m: Model<OrderDoc>,
    @InjectModel(WarehouseStockItems.name)
    readonly warehouseStockItems: Model<WarehouseStockItemsDoc>,
    private readonly stateMachineFactory: StateMachineFactory,
    private readonly sysLogsService: SYSLogService,
    @Inject(forwardRef(() => AddTransactionsService))
    private readonly addTransactionsService: AddTransactionsService,
    @Inject(forwardRef(() => ReleaseTransactionsService))
    private readonly releaseTransactionsService: ReleaseTransactionsService,
    @Inject(forwardRef(() => RefundTransactionService))
    private readonly refundTransactionsService: RefundTransactionService,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,
    @Inject(forwardRef(() => EntitiesService))
    private readonly entitiesService: EntitiesService,
    @Inject(forwardRef(() => TableService))
    private readonly tableService: TableService,
    private readonly servicesService: ServicesService,
    private readonly couponService: CouponService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly warehouseService: WarehouseManagementService,


  ) {
    super(m);
  }



  /// done
  async createOrder(req: RequestWithUser, dto: CreateCustomerOrderDto) {
    const session = await this.m.startSession();
    if (req.user.active !== true) throw new BadRequestException('012,R012');
    try {
      let subtotalItems = 0, subtotalServices = 0, totalPriceBeforeDiscount = 0, discountValue = 0, vat = 0, service = 0, subtotal = 0, totalPrice = 0;
      let entityExist, warehouseExist, items, services, onHoldData, status, totalPriceAndDiscountId, discountId, tableId, tableExist, order;
      entityExist = await this.entitiesService.findOneAndErr({ _id: this.toObjectId(dto.entityId) });
      warehouseExist = await this.warehouseService.findOneAndErr({ owner: this.toObjectId(entityExist.owner) });

      await session.withTransaction(async (): Promise<any> => {
        //items
        items = await this.orderService.orderItems(entityExist._id, dto);
        console.log("m", items);

        subtotalItems = (await items).reduce((accumulator, currentValue) => {
          return accumulator + currentValue.totalUnitPrice;
        }, 0);
        //services
        services = await this.orderService.servicesOrder(entityExist._id, dto);
        console.log("s", services);

        subtotalServices = (await services).reduce((accumulator, currentValue) => {
          return accumulator + currentValue.totalUnitPrice;
        }, 0);


        if (dto.orderStatus == OrderStatusEnum.ONHOLD) {
          onHoldData = await this.orderService.calculateQtyOfOnHoldItems(warehouseExist._id, items);
        }

        //calculate price
        subtotal = subtotalItems + subtotalServices;
        totalPriceAndDiscountId = await this.orderService.calculateTotalPrice(req, subtotal, entityExist.vat, entityExist.service, dto.couponCode, dto.customerId);
        totalPrice = totalPriceAndDiscountId.totalPrice;
        discountId = totalPriceAndDiscountId.discountId;
        totalPriceBeforeDiscount = totalPriceAndDiscountId.totalPriceWithService;
        discountValue = totalPriceAndDiscountId.discountValue;
        vat = totalPriceAndDiscountId.vat;
        service = totalPriceAndDiscountId.service;

        //check table
        if (dto.tableCode) {
          tableExist = await this.tableService.getTableByCode(req, {
            code: dto.tableCode,
          });
          if (!tableExist) throw new NotFoundException('036,R036');
          tableId = tableExist._id;
        }

        let status;
        if (dto.paymentMethod == PaymentMethodEnum.CASH) {
          status = StatusEnum.PENDING
        } else {
          status = StatusEnum.COMPLETED
        }

        order = await this.create({
          userId: this.toObjectId(dto.customerId),
          customerId: this.toObjectId(dto.customerId),
          warehouseId: warehouseExist._id,
          entityId: entityExist._id,
          discountId: discountId,
          orderStatus: OrderStatusEnum.ONHOLD,
          orderType: dto.orderType,
          status: status,
          items: items,
          services: services,
          totalOrder: subtotal.toFixed(2),
          vat: vat,
          service: service,
          totalPriceWithVatAndService: totalPriceBeforeDiscount.toFixed(2),
          discountValue: (discountValue) ? discountValue.toFixed(2) : 0.00,
          totalOrderWithDiscount: totalPrice,
          paymentMethod: dto.paymentMethod,
          methodName: (dto.methodName) ? dto.methodName : '',
          isOnline: dto.isOnline,
          deliveryAddress: (dto.deliveryAddress) ? dto.deliveryAddress : req.user.address,
          tableId: (tableId) ? tableId : '',
        },
          { session: session },
        );
        console.log("order", order);


        const cartExist = await this.cartService.findOne({ customerId: this.toObjectId(req.user._id), entityId: this.toObjectId(dto.entityId) });
        if (cartExist) {
          console.log("Cart", cartExist);
          await this.cartService.update(
            cartExist._id,
            { cartItems: [], subTotal: 0 },
            {},
            { session: session });
        }


      });// end session


      await session.commitTransaction();
      const result = await this.aggregateOne([
        { $match: { _id: order._id } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $lookup: {
            from: 'tables',
            localField: 'tableId',
            foreignField: '_id',
            as: 'table'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerData'
          }
        },
        {
          $lookup: {
            from: 'entities',
            localField: 'entityId',
            foreignField: '_id',
            as: 'entityData',
          }
        },

      ]);
      return result;
    }

    catch (err) {
      return { "message": "028,R028 " + err };
    }
    finally {
      session.endSession();
    }
  }


  /**
   * Edit Orders collection.
   */

  async findOrder(req: RequestWithUser, id: string) {
    const Order = await this.findOneById(id);
    if (!Order) throw new NotFoundException('order is not exist');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_ORDER,
    });
    const result = await this.aggregateOne([
      { $match: { _id: Order._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $lookup: {
          from: 'tables',
          localField: 'tableId',
          foreignField: '_id',
          as: 'table'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },

    ]);
    return result;
  }

}