import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { PayableTransactionTypeEnum } from 'src/payable/enums/payable-transaction-type.enum';

export class UpdateDeferredPayableDto {



  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  payableAmount :number;

  @IsNotEmpty()
  @IsEnum(PayableTransactionTypeEnum)
  @ApiProperty({ example:PayableTransactionTypeEnum.INTERNAL_NOTE})
  transactionType: PayableTransactionTypeEnum;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'write your notes  here' })
  notes?: string;

}

