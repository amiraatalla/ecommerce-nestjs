import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CustomerModule } from 'src/customer/customer.module';
import { DeferredRecievableModule } from 'src/deferred-recievable/deferred-recievable.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { Recievable, RecievableSchema } from './entities/recievable.entity';
import { RecievableController } from './recievable.controller';
import { RecievableService } from './recievable.service';

@Module({
    imports: [
        // MongooseModule.forFeature([
        //     { name: Recievable.name, schema: RecievableSchema },
        // ]),
        MongooseModule.forFeatureAsync([
            {
              name: Recievable.name,
              // injecting the active connection to pass to the plugin
              inject: [getConnectionToken()],
              useFactory: (connection: Connection) => {
                const schema = RecievableSchema;
      
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                schema.plugin(require('mongoose-sequence')(connection), {
                  id: 'recievable_seq',
                  inc_field: 'transactionID',
                  reference_fields: ['supplierId'],
                });
      
                return schema;
              },
            },
          ]),
        forwardRef(() =>DeferredRecievableModule),
        SYSLogModule,
        CustomerModule,
    ],
    controllers: [RecievableController],
    providers: [RecievableService],
    exports: [RecievableService]
})
export class RecievableModule { }
