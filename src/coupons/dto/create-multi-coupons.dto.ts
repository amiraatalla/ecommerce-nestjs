import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { CreateCuoponDto } from './create-coupon.dto';

export class CreateMultiCuoponsDto extends PickType(CreateCuoponDto,['value','limit','expireOn'])   {
  
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({example:11})
  startNumberToGenerate: number;

  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({example:15})
  endNumberToGenerate: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({example:'CU'})
  prefix: string;

}
