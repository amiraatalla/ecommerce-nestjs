import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { ItemDetails } from 'src/add-transactions/dto/create-add-transactions.dto';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
export class CreateRefundTransactionDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String}) 
   warehouseId: Types.ObjectId;
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  
  userId: Types.ObjectId;
  @IsDateString()
  date: Date;
  @IsArray()
  @Type(() => ItemDetails)
  @ValidateNested({ each: true })
  items: ItemDetails[];
}
