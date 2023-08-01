import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { CreateStockItemDto } from './create-stockitem.dto';

export class StockItemsWarehousesAssignment extends OmitType(CreateStockItemDto, [
  'stockCategoryId',
  'preferredSupplierId',
  'nameLocalized',
  'sku',
  'description',
  'type',
  'storageUnit',
  'picture',
  'unCodedItem',
  'trackExpiry',
  'trackBatches',
  'pricingMethod',
  'dailyBudget',
  'expectedMonthlyQtySold',
  'slowMoving'
]) {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  idToAssign: Types.ObjectId;
}
