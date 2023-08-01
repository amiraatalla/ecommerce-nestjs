import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCuoponDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  value: number;


  @IsOptional()
  @IsNumber()
  @ApiProperty()
  @Min(0)
  @Max(50)
  limit: number;

  
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  expireOn?: Date;

  status: boolean = true;

}
