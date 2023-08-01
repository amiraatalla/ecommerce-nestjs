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
import { ComparisonPeriod } from '../classes/comparison-class';
import { Period } from '../classes/period-class';

export class ReportItemSalesOptions {
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
  @Type(() => ComparisonPeriod)
  @ValidateNested({ each: true })
  @ApiProperty()
  comparisonByPeriod?: ComparisonPeriod;
  @IsOptional()
  @IsDateString()
  filterByDateFrom?: Date;

  @IsOptional()
  @IsDateString()
  filterByDateTo?: Date;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false})
  topRecords?: boolean
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false})
  slowMoving?: boolean
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false})
  noMoving?: boolean
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false})
  grossSales?: boolean
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false})
  avgBasketSize?: boolean
  // @IsOptional()
  // @IsBoolean()
  // @ApiProperty({ example: false})
  // sectionGrossSales?: boolean
}
