import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { PurchaseOrderClass } from './purchase-order.class';

export class CreatePurchaseOrderDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  warehouseId: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  supplierId?: Types.ObjectId;

  @IsArray()
  @Type(() => PurchaseOrderClass)
  @ValidateNested({ each: true })
  items: PurchaseOrderClass[];
}
