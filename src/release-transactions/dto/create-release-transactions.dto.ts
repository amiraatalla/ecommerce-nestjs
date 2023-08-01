import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';

export class ItemRelease {
 
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  stockItemId: Types.ObjectId;
 
  @IsNumber()
  qty: number;
 
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ApiProperty({ type: Number, readOnly: true })
  totalPrice: number;
}
export class CreateReleaseTransactionsDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  warehouseId: Types.ObjectId;
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  userId?: Types.ObjectId;
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  customerId?: Types.ObjectId;
  @IsDateString()
  date: Date;
  @IsArray()
  @Type(() => ItemRelease)
  @ValidateNested({ each: true })
  items: ItemRelease[];
}
