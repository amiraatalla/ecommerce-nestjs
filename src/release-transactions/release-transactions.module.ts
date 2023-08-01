import { forwardRef, Module } from '@nestjs/common';
import { ReleaseTransactionsService } from './release-transactions.service';
import { ReleaseTransactionsController } from './release-transactions.controller';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import {
  ReleaseTransactions,
  ReleaseTransactionsSchema,
} from './entities/release-transaction.entity';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ReleaseTransactions.name,
        // injecting the active connection to pass to the plugin
        inject: [getConnectionToken()],
        useFactory: (connection: Connection) => {
          const schema = ReleaseTransactionsSchema;

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-sequence')(connection), {
            id: 'release_seq',
            inc_field: 'ID',
            reference_fields: ['warehouseId'],
          });

          return schema;
        },
      },
    ]),
    forwardRef(() => StockItemDataModule),
  ],
  providers: [ReleaseTransactionsService],
  exports: [ReleaseTransactionsService],
  controllers: [ReleaseTransactionsController],
})
export class ReleaseTransactionsModule {}
