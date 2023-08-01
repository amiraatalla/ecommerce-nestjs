import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
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
import { StockItemBatches } from 'src/add-transactions/dto/create-add-transactions.dto';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { PartialReverseClass } from '../classes/partial-reverse-class';

export class SelectiveTtemBatches extends OmitType(StockItemBatches, ['_id']) {
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  _id?: Types.ObjectId;
}
export class ItemDetails {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  stockItemId: Types.ObjectId;
  @IsNumber()
  qty: number;
  @IsNumber()
  @IsPositive()
  price: number;
  @IsOptional()
  @IsArray()
  @Type(() => SelectiveTtemBatches)
  @ValidateNested({ each: true })
  batches?: SelectiveTtemBatches[];
  @IsOptional()
  @IsString()
  notes?: string;
}
export class CreateReverseTransactionsDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  
  addTransactionId: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @Type(() => PartialReverseClass)
  @ValidateNested({ each: true })
  partialReverse?: PartialReverseClass[];

  @IsDateString()
  date: Date;
  @IsOptional()
  @IsString()
  notes?: string;
}
