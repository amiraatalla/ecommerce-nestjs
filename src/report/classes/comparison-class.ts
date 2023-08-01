import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ComparisonEnum } from '../enums/comparison-enum';
import { PeriodEnum } from '../enums/period.enum';

export class ComparisonPeriod {
  @IsOptional()
  @IsDateString()
  //@Transform(({ value }) => moment(value).add(2, 'hour').startOf('day').toISOString())
  @ApiProperty({ type: Date })
  date: Date;
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ComparisonEnum))
  @ApiProperty()
  comparingPeriod: ComparisonEnum;
  @IsOptional()
  @IsDateString()
  //@Transform(({ value }) => moment(value).add(2, 'hour').startOf('day').toISOString())
  @ApiProperty({ type: Date })
  dateToCompare: Date;
}
