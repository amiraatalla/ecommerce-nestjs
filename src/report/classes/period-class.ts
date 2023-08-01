import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { PeriodEnum } from '../enums/period.enum';

export class Period {
  @IsOptional()
  @IsDateString()
  //@Transform(({ value }) => moment(value).add(2, 'hour').startOf('day').toISOString())
  @ApiProperty({ type: Date })
  date: Date;
  @IsOptional()
  @IsString()
  @IsIn(Object.values(PeriodEnum))
  @ApiProperty()
  period: PeriodEnum;
}
