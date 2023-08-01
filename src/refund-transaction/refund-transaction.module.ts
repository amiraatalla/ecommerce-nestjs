import { forwardRef, Module } from '@nestjs/common';
import { RefundTransactionService } from './refund-transaction.service';
import { RefundTransactionController } from './refund-transaction.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { RefundTransaction, RefundTransactionSchema } from './entities/refund-transaction-entity';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RefundTransaction.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = RefundTransactionSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'refund_seq',
            inc_field: 'ID',
            reference_fields: ['warehouseId'],
          });

          return schema;
        },
      },
    ]),
   forwardRef(() => StockItemDataModule),
    
  ],
  providers: [RefundTransactionService],
  controllers: [RefundTransactionController],
  exports: [RefundTransactionService],

})
export class RefundTransactionModule {}
