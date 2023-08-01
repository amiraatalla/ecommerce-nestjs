import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { AuditTransactionsController } from './audit-transactions.controller';
import { AuditTransactionsService } from './audit-transactions.service';
import { AuditTransactions, AuditTransactionsSchema } from './entities/audit-transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: AuditTransactions.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = AuditTransactionsSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'audit_seq',
            inc_field: 'ID',
            reference_fields: ['warehouseId'],
          });

          return schema;
        },
      },
    ]),
    StockItemDataModule,
  ],
  controllers: [AuditTransactionsController],
  providers: [AuditTransactionsService],
  exports: [AuditTransactionsService],
})
export class AuditTransactionsModule {}
