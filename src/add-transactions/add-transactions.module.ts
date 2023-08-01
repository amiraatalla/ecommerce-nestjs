import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { AddTransactionsController } from './add-transactions.controller';
import { AddTransactionsService } from './add-transactions.service';
import { AddTransactions, AddTransactionsSchema } from './entities/add-transactions.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: AddTransactions.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = AddTransactionsSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'add_seq',
            inc_field: 'ID',
            reference_fields: ['warehouseId'],
          });

          return schema;
        },
      },
    ]),
   forwardRef(() => StockItemDataModule),
  ],
  controllers: [AddTransactionsController],
  providers: [AddTransactionsService],
  exports: [AddTransactionsService],
})
export class AddTransactionsModule {}
