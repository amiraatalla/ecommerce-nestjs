import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { PayableTransactionTypeEnum } from '../enums/payable-transaction-type.enum';

export class CreatePayableDto {

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ example:'637f511e416690ff7d820138'})
  supplierId: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(PayableTransactionTypeEnum)
  @ApiProperty({ example:PayableTransactionTypeEnum.INTERNAL_NOTE})
  transactionType: PayableTransactionTypeEnum;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  payableAmount :number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  deferredPayableAmount :number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'write your notes  here' })
  notes?: string;

}

