import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';

class PartialReverseBatches {
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String}) 
  batchId?: Types.ObjectId;
  @ApiProperty({ type: Number })
  @IsNumber()
  qty: number;
}
export class PartialReverseClass {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  
  stockItemId: Types.ObjectId;
  @ApiProperty({ type: Number })
  @IsNumber()
  qty: number;
  @IsOptional()
  @IsArray()
  @Type(() => PartialReverseBatches)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [PartialReverseBatches] })
  batches?: PartialReverseBatches[];
}
