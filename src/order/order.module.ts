import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { Order, OrderSchema } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { WarehouseStockItems, WarehouseStockItemsSchema } from 'src/stock-item-data/entities/stock-item.entity';
import { ReleaseTransactionsModule } from 'src/release-transactions/release-transactions.module';
import { RefundTransactionModule } from 'src/refund-transaction/refund-transaction.module';
import { ReverseTransactionModule } from 'src/reverse-transaction/reverse-transaction.module';
import { AddTransactionsModule } from 'src/add-transactions/add-transactions.module';
import { Connection } from 'mongoose';
import { StateMachineModule } from '@buyby/state-machine';
import { ORDER_STATUS } from './constants/order.constant';
import { OrderStatusEnum } from './enums/order-status.enum';
import { OrderTransitionEnum } from './enums/order-transition.enum';
import { EntitiesModule } from 'src/Entities/entity.module';
import { ServicesModule } from 'src/services/services.module';
import { CouponModule } from 'src/coupons/coupon.module';
import { UsersModule } from 'src/users/users.module';
import * as bcrypt from 'bcryptjs';
import { TableModule } from 'src/tables/table.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      // { name: Order.name, schema: OrderSchema },
      { name: WarehouseStockItems.name, schema: WarehouseStockItemsSchema },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = OrderSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'order_seq',
            inc_field: 'ID',
            reference_fields: ['customerId','reset_field'],
          });

          return schema;
        },
      },
    ]),
    StateMachineModule.forRoot([
      {
        name: ORDER_STATUS,
        initialState: OrderStatusEnum.ACTIVE,
        states: Object.values(OrderStatusEnum),
        transitions: [
          {
            name: OrderTransitionEnum.ACTIVE,
            from: [OrderStatusEnum.ONHOLD],
            to: OrderStatusEnum.ACTIVE,
          },
          {
            name: OrderTransitionEnum.VOID,
            from: [OrderStatusEnum.ONHOLD],
            to: OrderStatusEnum.VOID,
          },
          {
            name: OrderTransitionEnum.REFUND,
            from: [OrderStatusEnum.ACTIVE],
            to: OrderStatusEnum.RETURN,
          },
          {
            name: OrderTransitionEnum.REFUND,
            from: [OrderStatusEnum.ACTIVE],
            to: OrderStatusEnum.REFUND,
          },

        ],
      },
    ]),
    SYSLogModule,
    forwardRef(() => ReleaseTransactionsModule),
    forwardRef(() => RefundTransactionModule),
    forwardRef(() => StockItemDataModule),
    forwardRef(() => ReverseTransactionModule),
    forwardRef(() => AddTransactionsModule),
    forwardRef(() => EntitiesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TableModule),
    ServicesModule,
    CouponModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule { }
