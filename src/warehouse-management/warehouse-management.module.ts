import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';
import { WarehouseManagementController } from './warehouse-management.controller';
import { WarehouseManagementService } from './warehouse-management.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Warehouse.name, schema: WarehouseSchema }]),
    forwardRef(()=> UsersModule),
  ],
  controllers: [WarehouseManagementController],
  providers: [WarehouseManagementService],
  exports: [WarehouseManagementService],
})
export class WarehouseManagementModule {}
