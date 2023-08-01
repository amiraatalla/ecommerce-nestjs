import { forwardRef, Module } from '@nestjs/common';
import { StockItemDataService } from './stock-item-data.service';
import { StockItemDataController } from './stock-item-data.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StockItem,
  StockItemSchema,
  WarehouseStockItems,
  WarehouseStockItemsSchema,
} from './entities/stock-item.entity';
import { UsersModule } from 'src/users/users.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { SuppliersModule } from 'src/suppliers/suppliers.module';
import { WarehouseManagementModule } from 'src/warehouse-management/warehouse-management.module';
import {
  StockItemTransactions,
  StockItemTransactionsSchema,
} from './entities/stock-item-transaction.entity';
import { ConfigModule } from 'src/config/config.module';
import { MailModule } from '@buyby/mail';
import { NotificationModule } from 'src/notification/notification.module';
import { UploadModule } from 'src/upload/upload.module';
import { StockCategoryModule } from 'src/stock-category/stock-category.module';
import { OrderModule } from 'src/order/order.module';
import { ReleaseTransactionsModule } from 'src/release-transactions/release-transactions.module';
import { StockItemDataCustomerService } from './stock-item-data-customer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockItem.name, schema: StockItemSchema },
      { name: WarehouseStockItems.name, schema: WarehouseStockItemsSchema },
      { name: StockItemTransactions.name, schema: StockItemTransactionsSchema },
    ]),
    forwardRef(() => NotificationModule),
    forwardRef(() => UsersModule),
    forwardRef(() => OrderModule),
    forwardRef(()=>PurchaseOrderModule),
    MailModule.Deferred,
    ConfigModule.Deferred,
    SuppliersModule,
    UploadModule,
    forwardRef(()=>WarehouseManagementModule),
    forwardRef(()=>StockCategoryModule),
    ReleaseTransactionsModule,
    
  ],
  providers: [StockItemDataService,StockItemDataCustomerService],
  controllers: [StockItemDataController],
  exports: [StockItemDataService, StockItemDataCustomerService],
})
export class StockItemDataModule {}
