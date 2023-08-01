import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { WasteBatches } from 'src/waste-transaction/dto/create-waste-transaction.dto';

export class ShrinkageItems {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String }) stockItemId: Types.ObjectId;
  @IsPositive()
  shrinkQty: number;
  @IsOptional()
  @IsArray()
  @Type(() => WasteBatches)
  @ValidateNested({ each: true })
  batches?: WasteBatches[];
  @IsOptional()
  @IsString()
  notes?: string;
}
export class CreateShrinkageTransactionDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  warehouseId: Types.ObjectId;
  @IsDateString()
  date: Date;
  @IsArray()
  @Type(() => ShrinkageItems)
  @ValidateNested({ each: true })
  items: ShrinkageItems[];
}
