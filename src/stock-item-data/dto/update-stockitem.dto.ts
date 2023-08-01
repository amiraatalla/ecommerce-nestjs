import { OmitType } from '@nestjs/swagger';
import { CreateStockItemDto } from './create-stockitem.dto';

export class UpdateStockItemDto extends OmitType(CreateStockItemDto, [
  'storageUnit',
  'warehouseId',
  'minQty',
  'maxQty',
  'minQtyAlert',
  'maxQtyAlert',
  'reOrderPoint',
  'qtyToOrder',
  'purchasePrice',
  'sellingPrice',
  'parLevel',
  'type',
  'pricingMethod',
  'dailyBudget',
  'expectedMonthlyQtySold',
  'slowMoving'
]) {}
