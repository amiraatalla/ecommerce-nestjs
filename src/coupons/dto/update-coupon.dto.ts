import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';

export class UpdateCouponDto {
  
  @IsOptional()
  @ApiProperty()
  @IsDateString()
  expireOn?: Date;

  @ValidateIf(val => val.expireOn)
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  status:boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  @Min(0)
  @Max(50)
  limit?: number;

  @ValidateIf(value => value.limit)
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  used:boolean;

}
