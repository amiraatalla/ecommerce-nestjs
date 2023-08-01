import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
