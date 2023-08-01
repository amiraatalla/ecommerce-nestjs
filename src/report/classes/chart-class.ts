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
import { ChartEnum } from '../enums/chart.enum';
import { PeriodEnum } from '../enums/period.enum';

export class Chart {
  @IsOptional()
  @IsDateString()
  //@Transform(({ value }) => moment(value).add(2, 'hour').startOf('day').toISOString())
  @ApiProperty({ type: Date })
  date: Date;
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ChartEnum))
  @ApiProperty()
  period: ChartEnum;
  // @IsOptional()
  // @IsDateString()
  // //@Transform(({ value }) => moment(value).add(2, 'hour').startOf('day').toISOString())
  // //@ApiProperty({ type: Date, example: 'false' })
  // filterByDateTo: Date;
}
