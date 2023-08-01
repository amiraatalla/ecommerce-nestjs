import { OmitType } from '@nestjs/swagger';
import { CreateStockItemDto } from './create-stockitem.dto';

export class ImportStockItemDto extends OmitType(CreateStockItemDto, [
  'warehouseId',
  'stockCategoryId',
  'preferredSupplierId',
]) {}
