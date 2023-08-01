import { OmitType } from '@nestjs/swagger';
import { StockItemsWarehousesAssignment } from './stockitems-warehouses-assignment.dto';

export class UpdateWarehoseStockItemDto extends OmitType(StockItemsWarehousesAssignment, [
  'idToAssign',
  'warehouseId',
]) {}
