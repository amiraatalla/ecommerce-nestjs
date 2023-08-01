import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { RecievableModule } from 'src/receivable/receivable.module';
import { UsersModule } from 'src/users/users.module';
import { DeferredRecievableService } from './deferred-recievable.service';
import { DeferredRecievableController } from './deferred-recievable.controller';
import { DeferredRecievable, DeferredRecievableSchema } from './entities/deferred-recievable.entity';
import { Connection } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DeferredRecievable.name, schema: DeferredRecievableSchema },
        ]),
        // MongooseModule.forFeatureAsync([
        //     {
        //       name: DeferredRecievable.name,
        //       // injecting the active connection to pass to the plugin
        //       inject: [getConnectionToken()],
        //       useFactory: (connection: Connection) => {
        //         const schema = DeferredRecievableSchema;
      
        //         // eslint-disable-next-line @typescript-eslint/no-var-requires
        //         schema.plugin(require('mongoose-sequence')(connection), {
        //           id: 'deferred_recievable_seq',
        //           inc_field: 'ID',
        //           reference_fields: ['supplierId'],
        //         });
      
        //         return schema;
        //       },
        //     },
        //   ]),
        forwardRef(() =>RecievableModule),
    ],
    controllers: [DeferredRecievableController],
    providers: [DeferredRecievableService],
    exports: [DeferredRecievableService]
})
export class DeferredRecievableModule { }
