import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DeferredPayableModule } from 'src/deferred-payable/deferred-payable.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { Payable, PayableSchema } from './entities/payable.entity';
import { PayableController } from './payable.controller';
import { PayableService } from './payable.service';

@Module({
    imports: [
        // MongooseModule.forFeature([
        //     { name: Payable.name, schema: PayableSchema },
        // ]),
        MongooseModule.forFeatureAsync([
            {
              name: Payable.name,
              // injecting the active connection to pass to the plugin
              inject: [getConnectionToken()],
              useFactory: (connection: Connection) => {
                const schema = PayableSchema;
      
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                schema.plugin(require('mongoose-sequence')(connection), {
                  id: 'payable_seq',
                  inc_field: 'transactionID',
                  reference_fields: ['supplierId'],
                });
      
                return schema;
              },
            },
          ]),
        forwardRef(() =>DeferredPayableModule),
        SYSLogModule
    ],
    controllers: [PayableController],
    providers: [PayableService],
    exports: [PayableService]
})
export class PayableModule { }
