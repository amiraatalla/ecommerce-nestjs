import { Module } from '@nestjs/common';
import { ShrinkageTransactionService } from './shrinkage-transaction.service';
import { ShrinkageTransactionController } from './shrinkage-transaction.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ShrinkageTransaction,
  ShrinkageTransactionSchema,
} from './entities/shrinkage-transaction.entity';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ShrinkageTransaction.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = ShrinkageTransactionSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'shrinkage_seq',
            inc_field: 'ID',
            reference_fields: ['warehouseId'],
          });

          return schema;
        },
      },
    ]),
    StockItemDataModule,
  ],
  providers: [ShrinkageTransactionService],
  controllers: [ShrinkageTransactionController],
  exports: [ShrinkageTransactionService],

})
export class ShrinkageTransactionModule {}
