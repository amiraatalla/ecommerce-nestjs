import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { SelectiveTtemBatches } from 'src/reverse-transaction/dto/create-reverse-transaction.dto';

export class WasteBatches {
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String}) 
 _id?: Types.ObjectId;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date })
  expiryDate?: Date;
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  batchNo?: string;
}
export class WasteItems {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})
  stockItemId: Types.ObjectId;
  @IsPositive()
  wasteQty: number;
  @IsOptional()
  @IsArray()
  @Type(() => WasteBatches)
  @ValidateNested({ each: true })
  batches?: WasteBatches[];
  @IsOptional()
  @IsString()
  notes?: string;
}
export class CreateWasteTransactionDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  warehouseId: Types.ObjectId;
  @IsDateString()
  date: Date;
  @IsArray()
  @Type(() => WasteItems)
  @ValidateNested({ each: true })
  items: WasteItems[];
}
