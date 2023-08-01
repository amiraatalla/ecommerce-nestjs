import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';

export class StockItemBatches {
  // @ApiProperty({ type: Types.ObjectId, default: () => new Types.ObjectId(), readOnly: true })
  // _id: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  _id?: Types.ObjectId;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  batchNo?: string;

  @IsOptional()
  @IsPositive()
  @ApiProperty({ type: Number })
  qty?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty({ type: Number })
  price?: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date })
  dateTimeReceived?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date })
  expiryDate?: Date;
}
export class ItemDetails {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  stockItemId: Types.ObjectId;

  @IsNumber()
  @ApiProperty({ type: Number })
  qty: number;

  @IsPositive()
  @ApiProperty({ type: Number })
  price: number;

  @IsOptional()
  @IsArray()
  @Type(() => StockItemBatches)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [StockItemBatches] })
  batches?: StockItemBatches[];

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  notes?: string;
}
export class CreateAddTransactionsDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String }) warehouseId: Types.ObjectId;
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String }) purchaseOrderId?: Types.ObjectId;
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String }) supplierId?: Types.ObjectId;
  @IsDateString()
  @ApiProperty({ type: Date })
  date: Date;
  @IsArray()
  @Type(() => ItemDetails)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [ItemDetails] })
  items: ItemDetails[];
}
