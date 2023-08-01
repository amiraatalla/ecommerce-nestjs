import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Chart } from '../classes/chart-class';
import { Period } from '../classes/period-class';

export class DateFilter {
    @IsOptional()
    @IsArray()
    @IsObject({ each: true })
    @ApiProperty({ example: [] })
    filterBy?: Record<string, any>[] = [];
    @IsOptional()
    @Type(() => Period)
    @ValidateNested({ each: true })
    @ApiProperty()
    filterPeriod?: Period;
  
    @IsOptional()
    @IsDateString()
    @ApiProperty({ type: String, example: '2022-01-01' })
    filterByDateFrom?: Date;
  
    @IsOptional()
    @IsDateString()
    @ApiProperty({ type: String, example: '2024-01-02' })
    filterByDateTo?: Date; 
}