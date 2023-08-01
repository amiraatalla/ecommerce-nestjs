import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { PayableModule } from 'src/payable/payable.module';
import { UsersModule } from 'src/users/users.module';
import { DeferredPayableController } from './deferred-payable.controller';
import { DeferredPayableService } from './deferred-payable.service';
import { DeferredPayable, DeferredPayableSchema } from './entities/deferred-payable.entity';
import { Connection } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DeferredPayable.name, schema: DeferredPayableSchema },
        ]),
        // MongooseModule.forFeatureAsync([
        //     {
        //       name: DeferredPayable.name,
        //       // injecting the active connection to pass to the plugin
        //       inject: [getConnectionToken()],
        //       useFactory: (connection: Connection) => {
        //         const schema = DeferredPayableSchema;
      
        //         // eslint-disable-next-line @typescript-eslint/no-var-requires
        //         schema.plugin(require('mongoose-sequence')(connection), {
        //           id: 'deferred_payable_seq',
        //           inc_field: 'ID',
        //           reference_fields: ['supplierId'],
        //         });
      
        //         return schema;
        //       },
        //     },
        //   ]),
        forwardRef(() =>PayableModule),
    ],
    controllers: [DeferredPayableController],
    providers: [DeferredPayableService],
    exports: [DeferredPayableService]
})
export class DeferredPayableModule { }
