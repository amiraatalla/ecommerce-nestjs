import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AddTransactionsModule } from 'src/add-transactions/add-transactions.module';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import {
  ReverseTransactions,
  ReverseTransactionsSchema,
} from './entities/reverse-transaction.entity';
import { ReverseTransactionController } from './reverse-transaction.controller';
import { ReverseTransactionService } from './reverse-transaction.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ReverseTransactions.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = ReverseTransactionsSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'reverse_seq',
            inc_field: 'ID',
            reference_fields: ['warehouseId'],
          });

          return schema;
        },
      },
    ]),
   forwardRef(() => StockItemDataModule),
   forwardRef(() => AddTransactionsModule),

  ],
  controllers: [ReverseTransactionController],
  providers: [ReverseTransactionService],
  exports: [ReverseTransactionService],
})
export class ReverseTransactionModule {}
