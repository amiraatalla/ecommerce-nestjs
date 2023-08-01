import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { ConfigModuleConfig } from './config/options/config.config';
import { MongooseModuleConfig } from './config/options/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from 'libs/mail/src';
import { MailModuleConfig } from './config/options/mail.config';
import { SYSLogModule } from './sysLog/sysLog.module';
import { NotificationModule } from './notification/notification.module';
import { SubscriptionModule } from './subscribtion/subscribtion.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { CouponModule } from './coupons/coupon.module';
import { CustomerModule } from './customer/customer.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PayableModule } from './payable/payable.module';
import { DeferredPayableModule } from './deferred-payable/deferred-payable.module';
import { RecievableModule } from './receivable/receivable.module';
import { DeferredRecievableModule } from './deferred-recievable/deferred-recievable.module';
import { NoteModule } from './notes/note.module';
import { OrderModule } from './order/order.module';
import { EntitiesModule } from './Entities/entity.module';
import { AddTransactionsModule } from './add-transactions/add-transactions.module';
import { AuditTransactionsModule } from './audit-transactions/audit-transactions.module';
import { ShrinkageTransactionModule } from './shrinkage-transaction/shrinkage-transaction.module';
import { ServicesModule } from './services/services.module';
import { WasteTransactionModule } from './waste-transaction/waste-transaction.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { StockItemDataModule } from './stock-item-data/stock-item-data.module';
import { StockCategoryModule } from './stock-category/stock-category.module';
import { WarehouseManagementModule } from './warehouse-management/warehouse-management.module';
import { PaymentModule } from './payment/payment.module';
import { ReverseTransactionModule } from './reverse-transaction/reverse-transaction.module';
import { ReleaseTransactionsModule } from './release-transactions/release-transactions.module';
import { UploadModule } from './upload/upload.module';
import { RefundTransactionModule } from './refund-transaction/refund-transaction.module';
import { ReportModule } from './report/report.module';
import { OrderStatusEnum } from './order/enums/order-status.enum';
import { ScheduleModule } from '@nestjs/schedule';
import { QuotationModule } from './qoutation/quotation.module';
import { CartModule } from './cart/cart.module';
import { CustomerOrderModule } from './customer-order/customer-order.module';
import { TableModule } from './tables/table.module';
import { EtisalatSMSModule } from './etisalat-sms/etisalat-sms.module';

@Module({
  imports: [
    ConfigModule.forRootAsync(ConfigModule, { useClass: ConfigModuleConfig }),
    MongooseModule.forRootAsync({
      useClass: MongooseModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    MailModule.forRootAsync(MailModule, {
      useClass: MailModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    SYSLogModule,
    SubscriptionModule,
    NotificationModule,
    TutorialModule,
    CustomerModule,
    CouponModule,
    SuppliersModule,
    PayableModule,
    DeferredPayableModule,
    RecievableModule,
    DeferredRecievableModule,
    NoteModule,
    OrderModule,
    EntitiesModule,
    AddTransactionsModule,
    AuditTransactionsModule,
    ShrinkageTransactionModule,
    ServicesModule,
    WasteTransactionModule,
    PurchaseOrderModule,
    StockItemDataModule,
    StockCategoryModule,
    WarehouseManagementModule,
    PaymentModule,
    ReverseTransactionModule,
    ReleaseTransactionsModule,
    RefundTransactionModule,
    UploadModule,
    ReportModule,
    QuotationModule,
    CartModule,
    CustomerOrderModule,
    TableModule,
    EtisalatSMSModule,
  ],

 

 
 
 
})
export class AppModule { }
