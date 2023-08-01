import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddTransactionsModule } from 'src/add-transactions/add-transactions.module';
import { AuditTransactionsModule } from 'src/audit-transactions/audit-transactions.module';
import { ConfigModule } from 'src/config/config.module';
import { CouponModule } from 'src/coupons/coupon.module';
import { CustomerModule } from 'src/customer/customer.module';
import { DeferredPayableModule } from 'src/deferred-payable/deferred-payable.module';
import { DeferredRecievableModule } from 'src/deferred-recievable/deferred-recievable.module';
import { DeferredRecievable } from 'src/deferred-recievable/entities/deferred-recievable.entity';
import { EntitiesModule } from 'src/Entities/entity.module';
import { OrderModule } from 'src/order/order.module';
import { PayableModule } from 'src/payable/payable.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { RecievableModule } from 'src/receivable/receivable.module';
import { RefundTransactionModule } from 'src/refund-transaction/refund-transaction.module';
import { ReleaseTransactionsModule } from 'src/release-transactions/release-transactions.module';
import { ReverseTransactionModule } from 'src/reverse-transaction/reverse-transaction.module';
import { ServicesModule } from 'src/services/services.module';
import { ShrinkageTransactionModule } from 'src/shrinkage-transaction/shrinkage-transaction.module';
import { StockCategoryModule } from 'src/stock-category/stock-category.module';
import { WarehouseStockItems, WarehouseStockItemsSchema } from 'src/stock-item-data/entities/stock-item.entity';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { SubscriptionModule } from 'src/subscribtion/subscribtion.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UploadModule } from 'src/upload/upload.module';
import { UsersModule } from 'src/users/users.module';
import { WarehouseManagementModule } from 'src/warehouse-management/warehouse-management.module';
import { WasteTransactionModule } from 'src/waste-transaction/waste-transaction.module';
import { Report, ReportSchema } from './entities/report.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Report.name, schema: ReportSchema },
            { name: WarehouseStockItems.name, schema: WarehouseStockItemsSchema },
            
        ]),
        SYSLogModule,
        CustomerModule,
        EntitiesModule,
        StockItemDataModule,
        StockCategoryModule,
        WasteTransactionModule,
        WarehouseManagementModule,
        PayableModule,
        DeferredPayableModule,
        RecievableModule,
        DeferredRecievableModule,
        UsersModule,
        CouponModule,
        AddTransactionsModule,
        AuditTransactionsModule,
        ShrinkageTransactionModule,
        ReverseTransactionModule,
        ReleaseTransactionsModule,
        RefundTransactionModule,
        PurchaseOrderModule,
        ServicesModule,
        OrderModule,
        SubscriptionModule,
        ConfigModule.Deferred,
        UploadModule,
    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService]
})
export class ReportModule { }
