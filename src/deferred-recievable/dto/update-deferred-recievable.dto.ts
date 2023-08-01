import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { RecievableTransactionTypeEnum } from 'src/receivable/enums/recievable-transaction-enum';

export class UpdateDeferredRecievableDto {



  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  recievableAmount :number;

  @IsNotEmpty()
  @IsEnum(RecievableTransactionTypeEnum)
  @ApiProperty({ example:RecievableTransactionTypeEnum.INTERNAL_NOTE})
  transactionType: RecievableTransactionTypeEnum;



  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'write your notes  here' })
  notes?: string;

}

