import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from 'src/customer/customer.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { WarehouseManagementModule } from 'src/warehouse-management/warehouse-management.module';
import { Entities, EntitiesSchema } from './entities/entities.entity';
import { EntitiesController } from './entity.controller';
import { EntitiesService } from './entity.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Entities.name, schema: EntitiesSchema },
        ]),
        forwardRef(() =>UsersModule),
        forwardRef(() =>CustomerModule),
        SYSLogModule,
        forwardRef(() =>WarehouseManagementModule),
    ],
    controllers: [EntitiesController],
    providers: [EntitiesService],
    exports: [EntitiesService]
})
export class EntitiesModule { }
