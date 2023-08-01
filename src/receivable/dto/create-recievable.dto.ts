import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { RecievableTransactionTypeEnum } from '../enums/recievable-transaction-enum';

export class CreateRecievableDto {

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ example:'637f5093416690ff7d82012c'})
  customerId: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(RecievableTransactionTypeEnum)
  @ApiProperty({ example:RecievableTransactionTypeEnum.INTERNAL_NOTE})
  transactionType: RecievableTransactionTypeEnum;


  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  recievableAmount :number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  deferredRecievableAmount :number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'write your notes  here' })
  notes?: string;

}

