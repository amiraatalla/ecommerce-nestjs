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
import { CreateOrderDto } from './dto/create-order.dto';
import { ActiveOnHoldOrderDto } from './dto/active-onhold-order.dto';
import { OrderSearchOptions } from './dto/order-search-options.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VoidedOrderDto } from './dto/void-order.dto';
import { Order, OrderDoc } from './entities/order.entity';
import { OrderStatusEnum } from './enums/order-status.enum';
import {
  WarehouseStockItems,
  WarehouseStockItemsDoc,
} from 'src/stock-item-data/entities/stock-item.entity';
import { ReleaseTransactionsService } from 'src/release-transactions/release-transactions.service';
import { RefundTransactionService } from 'src/refund-transaction/refund-transaction.service';
import { AddTransactionsService } from 'src/add-transactions/add-transactions.service';
import { RefundedOrderDto } from './dto/refunded-order.dto';
import { ReturnedOrderDto } from './dto/returned-order.dto';
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
import { UsersService } from 'src/users/users.service';
import { CheckPinDto } from './dto/check-pin.dto';
import * as bcrypt from 'bcryptjs';
import { TableService } from 'src/tables/table.service';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { release } from 'os';
import { doesNotThrow } from 'assert';

@Injectable()
export class OrderService extends BaseService<OrderDoc> {
  constructor(
    @InjectModel(Order.name) readonly m: Model<OrderDoc>,
    @InjectModel(WarehouseStockItems.name)
    readonly warehouseStockItems: Model<WarehouseStockItemsDoc>,
    readonly stateMachineFactory: StateMachineFactory,
    readonly sysLogsService: SYSLogService,
    @Inject(forwardRef(() => AddTransactionsService))
    readonly addTransactionsService: AddTransactionsService,
    @Inject(forwardRef(() => ReleaseTransactionsService))
    readonly releaseTransactionsService: ReleaseTransactionsService,
    @Inject(forwardRef(() => RefundTransactionService))
    readonly refundTransactionsService: RefundTransactionService,
    @Inject(forwardRef(() => StockItemDataService))
    readonly stockItemService: StockItemDataService,
    @Inject(forwardRef(() => EntitiesService))
    readonly entitiesService: EntitiesService,
    @Inject(forwardRef(() => TableService))
    readonly tableService: TableService,
    readonly servicesService: ServicesService,
    readonly couponService: CouponService,
    @Inject(forwardRef(() => UsersService))
    readonly usersService: UsersService,
  ) {
    super(m);
  }

  //active order
  async retrieveQtyOfOnHoldItems(warehouseId, items) {
    let newQtyOnHold = 0;
    let updatedWarehouseStockItems;
    try {
      for (const item in items) {
        console.log("item", items[item]);
        const stockItem = await this.stockItemService.findOneById(
          items[item].stockItemId
        );
        const warehouseItem = await this.warehouseStockItems.findOne(
          { _id: stockItem.warehouseStockItemsData, warehouseId: warehouseId });
        console.log('warehouseItem', warehouseItem);
        newQtyOnHold = warehouseItem.qtyOnHold - items[item].qty;
        if (newQtyOnHold < 0) throw new BadRequestException("113");
        console.log("qtyOnHold", newQtyOnHold);
        updatedWarehouseStockItems = await this.stockItemService.warehouseStockItems.updateOne(
          { _id: this.toObjectId(warehouseItem._id) }, { qtyOnHold: newQtyOnHold });
      }
      return updatedWarehouseStockItems.qtyOnHold;
    } catch (error) {
      throw error
    }
  }

  //return order
  async returnedItemsOrder(req: RequestWithUser, dto) {
    let result;
    let total = 0;
    let totalOrder = 0;
    let nameLocalized;
    let unitPrice;
    let totalUnitPrice;
    let qty;
    let notes;
    let stockItemId;
    let orderServices = {};
    let ordersServices = [];
    let returnedOrderItem = {};
    let returnedOrderItems = [];
    let totalReturned = 0;
    let sku;
    let img;


    try {
      for (const returnedItem in dto.returnedItems) {
        const stockItem = await this.stockItemService.findOneById(
          dto.returnedItems[returnedItem].stockItemId,
        );
        console.log('stockItem', stockItem);

        if (stockItem) {
          const warehouseItem = await this.warehouseStockItems.findOne({
            _id: stockItem.warehouseStockItemsData,
          });
          console.log('warehouseItem', warehouseItem);
          console.log('OrderExist[returnedItem].unitPrice', dto.returnedItems[returnedItem].unitPrice);

          let totalReturnedPrice = dto.returnedItems[returnedItem].qty * dto.returnedItems[returnedItem].unitPrice;
          qty = dto.returnedItems[returnedItem].qty;
          unitPrice = dto.returnedItems[returnedItem].unitPrice;
          totalUnitPrice = totalReturnedPrice;
          nameLocalized = stockItem.nameLocalized;
          sku = (stockItem.sku) ? stockItem.sku : '';
          notes = dto.returnedItems[returnedItem].notes;
          stockItemId = this.toObjectId(stockItem._id);
          console.log('totalReturnedPrice', totalReturnedPrice);

          totalReturned += totalReturnedPrice;
          console.log('totalReturnedPrice', totalReturnedPrice);
          returnedOrderItem = {
            stockItemId: stockItemId,
            nameLocalized: nameLocalized,
            sku: sku,
            unitPrice: unitPrice,
            totalUnitPrice: totalUnitPrice,
            qty: qty,
            notes: (notes) ? notes : '',
          }
          console.log("returnedOrderItem", returnedOrderItem);

          returnedOrderItems.push(returnedOrderItem);
        }
      }
      return returnedOrderItems;
    } catch (error) {
      console.log("error", error);
      throw error
    }
  }
  async returnedServicesOrder(req: RequestWithUser, dto) {
    let result;
    let total = 0;
    let totalOrder = 0;
    let unitPrice;
    let totalUnitPrice;
    let qty;
    let notes;
    let orderServices = {};
    let ordersServices = [];
    let name;
    let returnedOrderService = {};
    let returnedOrderServices = [];
    let totalReturned = 0;
    let serviceId;



    try {
      for (const returnedService in dto.returnedServices) {
        const servicesExist = await this.servicesService.findOneById(
          dto.returnedServices[returnedService].serviceId,
        );
        console.log('servicesExist', servicesExist);

        if (servicesExist) {
          let totalReturnedPrice = dto.returnedServices[returnedService].qty * dto.returnedServices[returnedService].unitPrice;
          qty = dto.returnedServices[returnedService].qty;
          unitPrice = dto.returnedServices[returnedService].unitPrice;
          totalUnitPrice = totalReturnedPrice;
          name = servicesExist.name;
          notes = (dto.returnedServices[returnedService].notes) ? dto.returnedServices[returnedService].notes : '';
          serviceId = this.toObjectId(servicesExist._id);

          console.log('totalReturnedPrice', totalReturnedPrice);

          totalReturned += totalReturnedPrice;
          console.log('totalReturnedPrice', totalReturnedPrice);
          returnedOrderService = {
            serviceId: serviceId,
            name: name,
            unitPrice: unitPrice,
            totalUnitPrice: totalUnitPrice,
            qty: qty,
            notes: (notes) ? notes : '',
          }
          console.log("returnedOrderService", returnedOrderService);

          returnedOrderServices.push(returnedOrderService);
        }
      }
      return returnedOrderServices;
    } catch (error) {
      console.log("error", error);
      throw error
    }
  }
  async returnedTransactionForReturnedOrder(req: RequestWithUser, items, customerId) {
    let returnedItem = {}, returnedItems = [];
    let refund;
    try {
      for (const item in items) {
        returnedItem = {
          stockItemId: items[item].stockItemId,
          qty: items[item].qty,
          price: items[item].unitPrice,
        }
        returnedItems.push(returnedItem);

        const returnedData = {
          warehouseId: this.toObjectId(req.user.warehouseId),
          customerId: this.toObjectId(customerId),
          userId: req.user._id,
          date: new Date(Date.now()),
          items: returnedItems
        };
        console.log('data', returnedData);
        refund =
          await this.refundTransactionsService.createRefundTransactions(
            req,
            { ...returnedData },
          );
        console.log('refund', refund);
        return refund;
      }
    } catch (error) {
      throw error
    }

  }
  async releaseActiveItemsForReturnedOrder(req: RequestWithUser, orderExistId, items, customerId) {
    let releaseItem = {}, releaseItems = [];
    let release;
    const OrderExist = await this.findOneById(orderExistId);
    try {
      for (const item in items) {
        const target = await this.findOne({
          _id: OrderExist._id,
          'items.stockItemId': this.toObjectId(items[item].stockItemId)
        }, {
          items: { $elemMatch: { stockItemId: this.toObjectId(items[item].stockItemId) } }
        }
        ); console.log("target", target);
        if (!target) {
          releaseItem = {
            stockItemId: items[item].stockItemId,
            qty: items[item].qty,
            totalPrice: items[item].totalUnitPrice,
          }
        }
      }
      releaseItems.push(releaseItem);

      const data = {
        warehouseId: req.user.warehouseId,
        customerId: this.toObjectId(customerId),
        userId: req.user._id,
        date: new Date(Date.now()),
        items: releaseItems
      };
      console.log('data', data, "req.user.warehouseId", req.user.warehouseId, "dto.customerId", customerId);

      release =
        await this.releaseTransactionsService.createReleaseTransactions(
          req,
          { ...data },
        );
      return release;
    } catch (error) {
      throw error
    }
  }

  //refund
  async refundedItemsOrder(req: RequestWithUser, dto) {
    let result;
    let total = 0;
    let totalOrder = 0;
    let nameLocalized;
    let unitPrice;
    let totalUnitPrice;
    let qty;
    let notes;
    let stockItemId;
    let orderServices = {};
    let ordersServices = [];
    let returnedOrderItem = {};
    let returnedOrderItems = [];
    let totalReturned = 0;
    let sku;
    let img;


    try {
      for (const refundedItem in dto.refundedItems) {
        const stockItem = await this.stockItemService.findOneById(
          dto.refundedItems[refundedItem].stockItemId,
        );
        console.log('stockItem', stockItem);

        if (stockItem) {
          const warehouseItem = await this.warehouseStockItems.findOne({
            _id: stockItem.warehouseStockItemsData,
          });
          console.log('warehouseItem', warehouseItem);
          console.log('OrderExist[refundedItem].unitPrice', dto.refundedItems[refundedItem].unitPrice);

          let totalReturnedPrice = dto.refundedItems[refundedItem].qty * dto.refundedItems[refundedItem].unitPrice;
          qty = dto.refundedItems[refundedItem].qty;
          unitPrice = dto.refundedItems[refundedItem].unitPrice;
          totalUnitPrice = totalReturnedPrice;
          nameLocalized = stockItem.nameLocalized;
          sku = (stockItem.sku) ? stockItem.sku : '';
          notes = dto.refundedItems[refundedItem].notes;
          stockItemId = this.toObjectId(stockItem._id);
          console.log('totalReturnedPrice', totalReturnedPrice);

          totalReturned += totalReturnedPrice;
          console.log('totalReturnedPrice', totalReturnedPrice);
          returnedOrderItem = {
            stockItemId: stockItemId,
            nameLocalized: nameLocalized,
            sku: sku,
            unitPrice: unitPrice,
            totalUnitPrice: totalUnitPrice,
            qty: qty,
            notes: (notes) ? notes : '',
          }
          console.log("returnedOrderItem", returnedOrderItem);

          returnedOrderItems.push(returnedOrderItem);
        }
      }
      return returnedOrderItems;
    } catch (error) {
      console.log("error", error);
      throw error
    }
  }
  async refundedServicesOrder(req: RequestWithUser, dto) {
    let result;
    let total = 0;
    let totalOrder = 0;
    let unitPrice;
    let totalUnitPrice;
    let qty;
    let notes;
    let orderServices = {};
    let ordersServices = [];
    let name;
    let returnedOrderService = {};
    let returnedOrderServices = [];
    let totalReturned = 0;
    let serviceId;



    try {
      for (const refundedService in dto.refundedServices) {
        const servicesExist = await this.servicesService.findOneById(
          dto.refundedServices[refundedService].serviceId,
        );
        console.log('servicesExist', servicesExist);

        if (servicesExist) {
          let totalReturnedPrice = dto.refundedServices[refundedService].qty * dto.refundedServices[refundedService].unitPrice;
          qty = dto.refundedServices[refundedService].qty;
          unitPrice = dto.refundedServices[refundedService].unitPrice;
          totalUnitPrice = totalReturnedPrice;
          name = servicesExist.name;
          notes = (dto.refundedServices[refundedService].notes) ? dto.refundedServices[refundedService].notes : '';
          serviceId = this.toObjectId(servicesExist._id);

          console.log('totalReturnedPrice', totalReturnedPrice);

          totalReturned += totalReturnedPrice;
          console.log('totalReturnedPrice', totalReturnedPrice);
          returnedOrderService = {
            serviceId: serviceId,
            name: name,
            unitPrice: unitPrice,
            totalUnitPrice: totalUnitPrice,
            qty: qty,
            notes: (notes) ? notes : '',
          }
          console.log("returnedOrderService", returnedOrderService);

          returnedOrderServices.push(returnedOrderService);
        }
      }
      return returnedOrderServices;
    } catch (error) {
      console.log("error", error);
      throw error
    }
  }

  async refundedTransaction(req: RequestWithUser, items, customerId) {
    let refundedItem = {}, refundedItems = [];
    let refund;
    try {
      for (const item in items) {
        refundedItem = {
          stockItemId: items[item].stockItemId,
          qty: items[item].qty,
          price: items[item].unitPrice,
        }
        refundedItems.push(refundedItem);

        const returnedData = {
          warehouseId: this.toObjectId(req.user.warehouseId),
          customerId: this.toObjectId(customerId),
          userId: req.user._id,
          date: new Date(Date.now()),
          items: refundedItems
        };
        console.log('data', returnedData);
        refund =
          await this.refundTransactionsService.createRefundTransactions(
            req,
            { ...returnedData },
          );
        console.log('refund', refund);
        return refund;
      }
    } catch (error) {
      throw error
    }

  }

  async calculateTotalPriceForReturnedItems(req: RequestWithUser, subtotal, entityVat, entityService, discountValue, discountId?) {
    let totalPrice, discountExist;
    let vat = this.calculatePriceAfterVat(subtotal, entityVat);
    let service = this.calculatePriceAfterService(subtotal, entityService);
    let totalPriceWithService = subtotal + vat + service;

    if (discountValue > 0)
      discountExist = await this.couponService.findOneById(discountId);
    console.log("dis", discountExist);


    if (discountExist) {
      console.log("discountExist", discountExist);

      discountValue = this.calculateDiscountValue(totalPriceWithService, discountExist.value);
      console.log("discountValue", discountValue);

      totalPrice = this.calculateDiscount(totalPriceWithService, discountExist.value).toFixed(2);
      console.log("tot2", totalPrice);

    }
    else {
      totalPrice = this.calculateDiscount(totalPriceWithService, 0).toFixed(2);
      console.log("tot1", totalPrice);

    }
    console.log("tot", totalPrice);

    return {
      totalPrice: totalPrice,
      totalPriceWithService: totalPriceWithService,
      discountId: (discountExist) ? this.toObjectId(discountExist._id) : '',
      discountValue: discountValue,
      vat: vat,
      service: service
    };
  }
  //
  calculatePriceAfterVat(totalOrder: number, vat: number) {
    let vatValue = (vat * totalOrder) / 100;
    console.log("vatValue", vatValue);

    return vatValue;
  }

  calculatePriceAfterService(totalOrder: number, service: number) {
    let serviceValue = (service * totalOrder) / 100;
    console.log("serviceValue", serviceValue);

    return serviceValue;
  }
  calculateDiscountValue(totalOrder: number, discountValue: number) {
    let persentageValue = (discountValue * totalOrder) / 100;
    return persentageValue;
  }
  calculateDiscount(totalOrder: number, discountValue: number) {
    let value = 0;
    let persentageValue = (discountValue * totalOrder) / 100;
    value = totalOrder - persentageValue;
    console.log("value1", value);
    if (value <= 0) value = 0;
    console.log("value", value);
    return value;
  }
  async orderItems(entityId, dto) {
    const orderItems = [];
    let total = 0;

    try {
      for (const item of dto.items) {
        const stockItem = await this.stockItemService.findOne({
          _id: this.toObjectId(item.stockItemId),
          entityId: entityId,
        });

        if (!stockItem) {
          throw new BadRequestException(`201 with id ${item.stockItemId}`);
        }

        const warehouseItem = await this.warehouseStockItems.findOne({
          _id: stockItem.warehouseStockItemsData,
        });

        const totalPrice = item.qty * warehouseItem.sellingPrice;

        total += totalPrice;

        const orderItem = {
          stockItemId: this.toObjectId(stockItem._id),
          nameLocalized: stockItem.nameLocalized,
          sku: stockItem.sku || '',
          unitPrice: warehouseItem.sellingPrice,
          totalUnitPrice: totalPrice,
          qty: item.qty,
          notes: item.notes || 'no note',
          img: stockItem.picture,
        };

        orderItems.push(orderItem);
      }

      return orderItems;
    } catch (error) {
      console.error('Error in orderItems:', error);
      throw error;
    }
  }
  async servicesOrder(entityId, dto) {
    const orderItems = [];

    try {
      for (const service of dto.services) {
        const serviceItem = await this.servicesService.findOne({
          _id: this.toObjectId(service.serviceId),
          entityId: entityId,
        });

        if (!serviceItem) {
          throw new BadRequestException(`023,R023 with id ${service.serviceId} not found`);
        }

        const totalPrice = service.qty * serviceItem.price;
        const orderItem = {
          serviceId: this.toObjectId(serviceItem._id),
          name: serviceItem.name,
          unitPrice: serviceItem.price,
          totalUnitPrice: totalPrice,
          qty: service.qty,
          notes: service.notes || 'no note',
        };

        orderItems.push(orderItem);
      }

      return orderItems;
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }


  async releaseActiveItems(req: RequestWithUser, items, customerId) {
    let releaseItem = {}, releaseItems = [];
    let release;
    try {
      for (const item in items) {
        releaseItem = {
          stockItemId: items[item].stockItemId,
          qty: items[item].qty,
          totalPrice: items[item].totalUnitPrice,
        }
      }
      releaseItems.push(releaseItem);

      const data = {
        warehouseId: req.user.warehouseId,
        customerId: this.toObjectId(customerId),
        userId: req.user._id,
        date: new Date(Date.now()),
        items: releaseItems
      };
      console.log('data', data, "req.user.warehouseId", req.user.warehouseId, "dto.customerId", customerId);

      release =
        await this.releaseTransactionsService.createReleaseTransactions(
          req,
          { ...data },
        );
      return release;
    } catch (error) {
      throw error
    }
  }
  async calculateQtyOfOnHoldItems(warehouseId, items) {
    let newQtyOnHold = 0;
    let updatedWarehouseStockItems;
    try {
      for (const item in items) {
        console.log("item", items[item]);
        const stockItem = await this.stockItemService.findOneById(
          items[item].stockItemId
        );
        const warehouseItem = await this.warehouseStockItems.findOne(
          { _id: stockItem.warehouseStockItemsData, warehouseId: warehouseId });
        console.log('warehouseItem', warehouseItem);
        newQtyOnHold = warehouseItem.qtyOnHold + items[item].qty;
        console.log("qtyOnHold", newQtyOnHold);
        updatedWarehouseStockItems = await this.stockItemService.warehouseStockItems.updateOne(
          { _id: this.toObjectId(warehouseItem._id) }, { qtyOnHold: newQtyOnHold });
      }
      return updatedWarehouseStockItems.qtyOnHold;
    } catch (error) {
      throw error
    }
  }
  async calculateTotalPrice(req: RequestWithUser, subtotal, entityVat, entityService, couponCode, customerId) {
    let discountExist, totalPrice, discountValue;
    let vat = this.calculatePriceAfterVat(subtotal, entityVat);
    let service = this.calculatePriceAfterService(subtotal, entityService);
    let totalPriceWithService = subtotal + vat + service;

    if (couponCode)
      discountExist = await this.couponService.findCouponCode(req, {
        'code': couponCode,
        'customerId': customerId
      });
    console.log("dis", discountExist);


    if (discountExist) {
      console.log("discountExist", discountExist);

      discountValue = this.calculateDiscountValue(totalPriceWithService, discountExist.value);
      console.log("discountValue", discountValue);

      const discountLimit = await this.couponService.update(discountExist._id, { $push: { userIds: customerId } });

      if (discountLimit.limit == discountLimit.userIds.length)
        await this.couponService.update(discountLimit._id, { used: true });
      totalPrice = this.calculateDiscount(totalPriceWithService, discountExist.value).toFixed(2);
      console.log("tot2", totalPrice);

    }
    else {
      totalPrice = this.calculateDiscount(totalPriceWithService, 0).toFixed(2);
      console.log("tot1", totalPrice);

    }
    console.log("tot", totalPrice);

    return {
      totalPrice: totalPrice,
      totalPriceWithService: totalPriceWithService,
      discountId: (discountExist) ? this.toObjectId(discountExist._id) : '',
      discountValue: discountValue,
      vat: vat,
      service: service
    };
  }
  async createOrder(req: RequestWithUser, dto: CreateOrderDto) {
    let subtotalItems = 0, subtotalServices = 0, totalPriceBeforeDiscount = 0, discountValue = 0, vat = 0, service = 0, subtotal = 0, totalPrice = 0;
    let entityExist, items, services, releasedData, onHoldData, status, totalPriceAndDiscountId, discountId, tableId, tableExist;
    if (req.user.active !== true) throw new BadRequestException('012,R012');
    entityExist = await this.entitiesService.findOneById(req.user.entityId);
    //items
    items = await this.orderItems(entityExist._id, dto);
    console.log("m", items);

    subtotalItems = (await items).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);
    //services
    services = await this.servicesOrder(entityExist._id, dto);
    console.log("s", services);

    subtotalServices = (await services).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);

    //release
    if (dto.orderStatus == OrderStatusEnum.ACTIVE) {
      releasedData = await this.releaseActiveItems(req, items, dto.customerId);
    }
    //onhold
    else if (dto.orderStatus == OrderStatusEnum.ONHOLD) {
      onHoldData = await this.calculateQtyOfOnHoldItems(req.user.warehouseId, items);
    }

    //calculate price
    subtotal = subtotalItems + subtotalServices;
    totalPriceAndDiscountId = await this.calculateTotalPrice(req, subtotal, entityExist.vat, entityExist.service, dto.couponCode, dto.customerId);
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


    if (dto.paymentMethod == PaymentMethodEnum.CASH) {
      status = StatusEnum.COMPLETED
    } else {
      status = StatusEnum.PENDING
    }
    const order = await this.create({
      userId: req.user._id,
      entityId: req.user.entityId,
      customerId: this.toObjectId(dto.customerId),
      warehouseId: this.toObjectId(req.user.warehouseId),
      discountId: discountId,
      orderStatus: dto.orderStatus,
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
      tableId: (tableId) ? tableId : '',

    });
    console.log("order", order);
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

  /**
   * Edit Orders collection.
   */

  async updateOrder(req: RequestWithUser, id: string, dto: UpdateOrderDto) {
    let updatedOrder;
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const OrderExist = await this.findOneAndErr({
      userId: this.toObjectId(req.user._id),
      _id: this.toObjectId(id),
    });

    if (!OrderExist || OrderExist.orderStatus == OrderStatusEnum.VOID)
      throw new NotFoundException('011,R011');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_ORDER,
      });
      updatedOrder = await this.update(id, {
        ...dto,
      });
    }
    const result = await this.aggregateOne([
      { $match: { _id: updatedOrder._id } },
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

  async voidedOrder(req: RequestWithUser, id: string, orderStatus: string) {
    let refund;
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const OrderExist = await this.findOneAndErr({
      userId: this.toObjectId(req.user._id),
      _id: this.toObjectId(id),
      orderStatus: OrderStatusEnum.ACTIVE
    });

    console.log('OrderExist', OrderExist);

    if (!OrderExist || OrderExist.orderStatus == OrderStatusEnum.VOID)
      throw new NotFoundException('011,R011');

    //  returned Items

    let returnedItem = {};
    let returnedItems = [];

    for (const refundedItem in OrderExist.items) {
      const stockItem = await this.stockItemService.findOneById(
        OrderExist.items[refundedItem].stockItemId,
      );
      console.log('stockItem', stockItem);

      if (stockItem) {
        const warehouseItem = await this.warehouseStockItems.findOne({
          _id: stockItem.warehouseStockItemsData[0],
        });
        console.log('warehouseItem', warehouseItem);


        returnedItem = {
          "stockItemId": OrderExist.items[refundedItem].stockItemId,
          "qty": OrderExist.items[refundedItem].qty,
          "price": OrderExist.items[refundedItem].unitPrice,
        }
        returnedItems.push(returnedItem);
      } else { throw new BadRequestException("016,R016") }
    }
    const returnedData = {
      warehouseId: this.toObjectId(req.user.warehouseId),
      customerId: this.toObjectId(OrderExist.customerId),
      userId: req.user._id,
      date: new Date(Date.now()),
      items: returnedItems
    };
    console.log('data', returnedData);
    refund =
      await this.refundTransactionsService.createRefundTransactions(
        req,
        { ...returnedData },
      );
    console.log('refund', refund);
  }
  //items => items you want from your order
  //refunded items => items you want to return from your order
  async refundOrder(req: RequestWithUser, id: string, dto: RefundedOrderDto) { // cancelled part or full order and take money
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const OrderExist = await this.findOneAndErr({
      userId: this.toObjectId(req.user._id),
      _id: this.toObjectId(id),
      orderStatus: OrderStatusEnum.ACTIVE
    });
    if (!OrderExist) throw new BadRequestException("011,R011");
    const entityExist = await this.entitiesService.findOneById(OrderExist.entityId);

    let result, services, items, refundedServices, refundedItems, refundedTransaction, releasedData, discountId, totalPriceAndDiscountId;
    let subtotalItems = 0, subtotalServices = 0, subtotalRefundedItems = 0, subtotalRefundedServices = 0, totalPriceBeforeDiscount = 0, discountValue = 0, vat = 0, service = 0, subtotal = 0, totalPrice = 0;

    if (dto.refundMethod == ReturnMethodEnum.FULLY) {
      await this.voidedOrder(req, OrderExist._id, "REFUND");
      result = await this.update(id,
        {
          items: [],
          refundedItems: OrderExist.items,
          services: [],
          refundedServices: OrderExist.services,
          orderStatus: OrderStatusEnum.REFUND,
          orderOldPrice: OrderExist.totalOrder,
          totalOrder: 0,
          totalPriceWithVatAndService: 0,
          discountValue: 0,
          vat: 0,
          service: 0,
          totalOrderWithDiscount: 0
        });

    }
    //partially
    if (dto.refundMethod == ReturnMethodEnum.PARTIALLY) {

      // new Services
      services = await this.servicesOrder(entityExist._id, dto);
      subtotalServices = (await services).reduce((accumulator, currentValue) => {
        return accumulator + currentValue.totalUnitPrice;
      }, 0);
      // new Items
      items = await this.orderItems(entityExist._id, dto);
      subtotalItems = (await items).reduce((accumulator, currentValue) => {
        return accumulator + currentValue.totalUnitPrice;
      }, 0);
      // release new items
      releasedData = await this.releaseActiveItems(req, items, OrderExist.customerId);
      //  refunded Services
      refundedServices = await this.refundedServicesOrder(req, dto);
      subtotalRefundedServices = (await refundedServices).reduce((accumulator, currentValue) => {
        return accumulator + currentValue.totalUnitPrice;
      }, 0);
      //  refunded Items
      refundedItems = await this.refundedItemsOrder(req, dto);
      subtotalRefundedItems = (await refundedItems).reduce((accumulator, currentValue) => {
        return accumulator + currentValue.totalUnitPrice;
      }, 0);
      refundedTransaction = await this.refundedTransaction(req, refundedItems, OrderExist.customerId);

      subtotal = OrderExist.totalOrder + subtotalItems + subtotalServices - subtotalRefundedItems - subtotalRefundedServices;

      //calculate 
      //calculate price

      subtotal = subtotalItems + subtotalServices;
      console.log("subtotal", subtotal);

      totalPriceAndDiscountId = await this.calculateTotalPriceForReturnedItems(req, subtotal, entityExist.vat, entityExist.service, OrderExist.discountValue, OrderExist.discountId);
      totalPrice = totalPriceAndDiscountId.totalPrice;
      totalPriceBeforeDiscount = totalPriceAndDiscountId.totalPriceWithService;
      discountValue = totalPriceAndDiscountId.discountValue;
      vat = totalPriceAndDiscountId.vat;
      service = totalPriceAndDiscountId.service;

      result = await this.update(id,
        {
          items: items,
          refundedItems: refundedItems,
          services: services,
          refundedServices: refundedServices,
          orderOldPrice: OrderExist.totalOrder,
          totalOrder: subtotal,
          vat: vat,
          service: service,
          totalPriceWithVatAndService: totalPriceBeforeDiscount,
          discountValue: discountValue,
          totalOrderWithDiscount: totalPrice
        });

      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_ORDER,
      });

      const finalResult = await this.aggregateOne([
        { $match: { _id: result._id } },
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
      return finalResult
    }



    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_ORDER,
    });

    const finalResult = await this.aggregateOne([
      { $match: { _id: result._id } },
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
    return finalResult
  }

  async returnOrder(req: RequestWithUser, id: string, dto: ReturnedOrderDto) { // cancelled part or full order and take anothers
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const OrderExist = await this.findOneAndErr({
      userId: this.toObjectId(req.user._id),
      _id: this.toObjectId(id),
      orderStatus: OrderStatusEnum.ACTIVE
    });

    if (!OrderExist) throw new BadRequestException("011,R011");
    const entityExist = await this.entitiesService.findOneById(OrderExist.entityId);
    console.log("entityExist", entityExist);

    let result, services, items, returnedServices, returnedItems, returnedTransaction, releasedItems, releasedData, releasedPartiallyData, discountId, totalPriceAndDiscountId;
    let subtotalItems = 0, subtotalServices = 0, subtotalReturnedItems = 0, subtotalReturnedServices = 0, totalPriceBeforeDiscount = 0, discountValue = 0, vat = 0, service = 0, subtotal = 0, totalPrice = 0;

    // new Items
    items = await this.orderItems(entityExist._id, dto);
    subtotalItems = (await items).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);
    // new Services
    services = await this.servicesOrder(entityExist._id, dto);
    subtotalServices = (await services).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);
    //  returned Services
    returnedServices = await this.returnedServicesOrder(req, dto);
    subtotalReturnedServices = (await returnedServices).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);
    //  returned Items
    console.log("returned Items");
    returnedItems = await this.returnedItemsOrder(req, dto);
    subtotalReturnedItems = (await returnedItems).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);
    returnedTransaction = await this.returnedTransactionForReturnedOrder(req, returnedItems, OrderExist.customerId);
    console.log("returnedTransaction", returnedTransaction);


    //calculate 
    //calculate price
    console.log("calculate price");

    subtotal = subtotalItems + subtotalServices;
    console.log("subtotal", subtotal);

    totalPriceAndDiscountId = await this.calculateTotalPriceForReturnedItems(req, subtotal, entityExist.vat, entityExist.service, OrderExist.discountValue, OrderExist.discountId);
    totalPrice = totalPriceAndDiscountId.totalPrice;
    console.log("totalPrice = totalPriceAndDiscountId.totalPrice", totalPrice);

    totalPriceBeforeDiscount = totalPriceAndDiscountId.totalPriceWithService;
    discountValue = totalPriceAndDiscountId.discountValue;
    vat = totalPriceAndDiscountId.vat;
    service = totalPriceAndDiscountId.service;


    //fully
    if (dto.returnMethod == ReturnMethodEnum.FULLY) {
      // release new items
      releasedData = await this.releaseActiveItems(req, items, OrderExist.customerId);
      console.log("releasedData", releasedData);

      const voidedItems = await this.voidedOrder(req, OrderExist._id, "RETURN");
      result = await this.update(id,
        {
          items: items,
          returnedItems: OrderExist.items,
          services: services,
          returnedServices: OrderExist.services,
          orderStatus: OrderStatusEnum.RETURN,
          totalOrder: subtotal.toFixed(2),
          vat: vat,
          service: service,
          totalPriceWithVatAndService: totalPriceBeforeDiscount.toFixed(2),
          discountValue: discountValue,
          totalOrderWithDiscount: totalPrice,
          orderOldPrice: OrderExist.totalOrder.toFixed(2)
        });
    }//end fully

    //partially
    if (dto.returnMethod == ReturnMethodEnum.PARTIALLY) {
      // release new and Old items
      releasedPartiallyData = await this.releaseActiveItemsForReturnedOrder(req, OrderExist._id, items, OrderExist.customerId);
      console.log("releasedPartiallyData", releasedPartiallyData);
      result = await this.update(id,
        {
          items: items,
          returnedItems: returnedItems,
          services: services,
          returnedServices: returnedServices,
          orderOldPrice: OrderExist.totalOrder,
          totalOrder: subtotal,
          vat: vat,
          service: service,
          totalPriceWithVatAndService: totalPriceBeforeDiscount,
          discountValue: discountValue,
          totalOrderWithDiscount: totalPrice,
        });
    }//end partially

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_ORDER,
    });

    const finalResult = await this.aggregateOne([
      { $match: { _id: result._id } },
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
          from: 'entityExist',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },

    ]);
    return finalResult
  }


  async cancelOnHoldOrder(req: RequestWithUser, id: string) {
    let result;
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const OrderExist = await this.findOneAndErr({
      userId: this.toObjectId(req.user._id),
      _id: this.toObjectId(id),
      orderStatus: OrderStatusEnum.ONHOLD
    });

    console.log('OrderExist', OrderExist);

    if (!OrderExist || OrderExist.orderStatus == OrderStatusEnum.VOID)
      throw new NotFoundException('011,R011');


    const entity = new Order(JSON.parse(JSON.stringify(OrderExist)));
    const stateMachine = this.stateMachineFactory.create<Order>(entity, ORDER_STATUS)
    const transition = OrderTransitionEnum.VOID;
    await stateMachine.apply(transition);

    for (const item in OrderExist.items) {
      const stockItem = await this.stockItemService.findOneById(
        OrderExist.items[item].stockItemId,
      );
      console.log('stockItem', stockItem);

      if (stockItem) {
        const warehouseItem = await this.warehouseStockItems.findOne({
          _id: stockItem.warehouseStockItemsData,
        });
        console.log('warehouseItem', warehouseItem);


        let newQtyOnHold = 0;
        newQtyOnHold = warehouseItem.qtyOnHold - OrderExist.items[item].qty;
        if (newQtyOnHold < 0) throw new BadRequestException("113");
        console.log("qtyOnHold", newQtyOnHold);
        await this.stockItemService.warehouseStockItems.updateOne(
          { _id: this.toObjectId(warehouseItem._id) }, { qtyOnHold: newQtyOnHold });
      } else { throw new BadRequestException("016,R016") }
    }

    result = await this.update(entity._id,
      {
        orderStatus: entity.orderStatus,
        items: [],
        voidedItems: OrderExist.items,
        services: [],
        voidedServices: OrderExist.services,
        orderOldPrice: OrderExist.totalOrder,
        totalOrder: 0,
        totalPriceWithVatAndService: 0,
        discountValue: 0,
        vat: 0,
        service: 0,
        totalOrderWithDiscount: 0
      });
    console.log("result", result);

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_ORDER,
    });
    const finalResult = await this.aggregateOne([
      { $match: { _id: result._id } },
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
    return finalResult;

  }

  //return method





  async activeOnholdOrder(req: RequestWithUser, id: string, dto: ActiveOnHoldOrderDto) {
    let OrderExist;
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    OrderExist = await this.findOneAndErr({
      entityId: this.toObjectId(req.user.entityId),
      _id: this.toObjectId(id),
      orderStatus: OrderStatusEnum.ONHOLD
    });

    if (!OrderExist || OrderExist.orderStatus == OrderStatusEnum.VOID)
      throw new NotFoundException('011,R011');

    let subtotalItems = 0, subtotalServices = 0, totalPriceBeforeDiscount = 0, discountValue = 0, vat = 0, service = 0, subtotal = 0, totalPrice = 0;
    let result, entityExist, items, services, releasedData, activeData, status, totalPriceAndDiscountId, discountId, tableId, tableExist;

    entityExist = await this.entitiesService.findOneById(req.user.entityId);

    //items
    items = await this.orderItems(entityExist._id, dto);
    console.log("m", items);

    subtotalItems = (await items).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);
    //services
    services = await this.servicesOrder(entityExist._id, dto);
    console.log("s", services);

    subtotalServices = (await services).reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalUnitPrice;
    }, 0);

    //release
    if (dto.orderStatus == OrderStatusEnum.ACTIVE) {
      releasedData = await this.releaseActiveItems(req, items, dto.customerId);
    }

    //active
    activeData = await this.retrieveQtyOfOnHoldItems(OrderExist.warehouseId, items);


    //calculate price
    subtotal = subtotalItems + subtotalServices;
    totalPriceAndDiscountId = await this.calculateTotalPrice(req, subtotal, entityExist.vat, entityExist.service, dto.couponCode, dto.customerId);
    totalPrice = totalPriceAndDiscountId.totalPrice;
    discountId = totalPriceAndDiscountId.discountId;
    totalPriceBeforeDiscount = totalPriceAndDiscountId.totalPriceWithService;
    discountValue = totalPriceAndDiscountId.discountValue;
    vat = totalPriceAndDiscountId.vat;
    service = totalPriceAndDiscountId.service;



    result = await this.update(id, {
      userId: req.user._id,
      warehouseId: this.toObjectId(req.user.warehouseId),
      orderOldPrice: OrderExist.totalOrder,
      totalOrder: subtotal,
      vat: vat,
      service: service,
      totalPriceWithVatAndService: totalPriceBeforeDiscount.toFixed(2),
      discountValue: (discountValue) ? discountValue.toFixed(2) : 0.00,
      totalOrderWithDiscount: totalPrice,
      orderStatus: dto.orderStatus,
      items: items,
      services: services,
      status: StatusEnum.COMPLETED,
    });

    console.log("result", result);

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_ORDER,
    });
    const finalResult = await this.aggregateOne([
      { $match: { _id: result._id } },
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
    return finalResult
  }

  /**
    * Search Orders collection.  //done
    */
  async findAllByCustomer(
    customerId: Types.ObjectId,
    options: OrderSearchOptions,
  ): Promise<Pagination> {
    const aggregation = [];

    const {
      dir,
      offset,
      size,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;

    const sort = 'index';

    aggregation.push({ $match: { customerId } });


    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }
    aggregation.push({
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
      },);

    if (filterByDateFrom && filterByDateTo) {

      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);
  }

  /**
   * Search Orders collection.  //done
   */
  async findAll(
    entityId: Types.ObjectId,
    options: OrderSearchOptions,
  ): Promise<Pagination> {
    const aggregation = [];

    const {
      dir,
      offset,
      size,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;

    const sort = 'index';

    aggregation.push({ $match: { entityId } });


    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }

    aggregation.push(
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
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
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
    );


    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);
  }

  
  /**
   * Search Orders fields.
   */
  search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ orderStatus: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }


  //check pin
  async checkPin(req: RequestWithUser, dto: CheckPinDto) {
    const businessOwner = await this.usersService.findOneAndErr({ _id: this.toObjectId(req.user.owner) });
    console.log("businessOwner", businessOwner, dto.pin, businessOwner.pin);


    const isMatch = await bcrypt.compare(dto.pin, businessOwner.pin);
    console.log("match", isMatch);
    return isMatch;
    //   if(isMatch == true){
    //   return await this.usersService.findOneAndErr({ _id: this.toObjectId(dto.ownerId), pin: isMatch });
    // }
  }

  async findData(req: RequestWithUser, id: string) {
    const isOrderExist = await this.findOneById(id);
    if (!isOrderExist) throw new NotFoundException('order is not exist');
    const result = await this.aggregateOne([
      { $match: { _id: isOrderExist._id } },
      // { $unwind: '$items' },
      {
        $lookup: {
          from: 'stockitems',
          localField: 'items.nameLocalized.mainLanguage',
          foreignField: 'nameLocalized.mainLanguage',
          as: 'stockItem',
        },
      },
      {
        $addFields: {
          'items.stockItem': { $arrayElemAt: ['$stockItem', 0] },
        },
      },
      {
        $addFields: {
          'items.stockItem': { $arrayElemAt: ['$stockItem', 0] },
        },
      },
      { $unset: 'stockItem' },
      
    ]);
  
    return result;
  }
}
