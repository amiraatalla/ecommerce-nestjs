import { ApiProperty } from '@nestjs/swagger';
import {  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
export class CreateTableDto {
   

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'ACDS' })
  code: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '1' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'out doors' })
  area?: string;
  
  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1 })
  seats?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: 'false' })
  status?: boolean = false;
  
}
