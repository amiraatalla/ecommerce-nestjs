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

export class ReportOptions {
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
  @Type(() => Chart)
  @ValidateNested({ each: true })
  @ApiProperty()
  dailyChart?: Chart;
  @IsOptional()
  @IsDateString()
  filterByDateFrom?: Date;

  @IsOptional()
  @IsDateString()
  filterByDateTo?: Date;
//   @IsOptional()
//   @IsBoolean()
//   topRecords?: boolean
//   @IsOptional()
//   @IsBoolean()
//   slowMoving?: boolean
//   @IsOptional()
//   @IsBoolean()
//   noMoving?: boolean
//   @IsOptional()
//   @IsBoolean()
//   grossSales?: boolean
}
