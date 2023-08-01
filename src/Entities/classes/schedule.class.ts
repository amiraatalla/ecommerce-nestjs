import { Transform } from 'class-transformer';
import { IsDate, IsIn } from 'class-validator';
import { DaysEnum } from '../enum/days.enum';

/**
 * Operating days and hours of the restaurant.
 */
export class Schedule {
  @IsIn(Object.values(DaysEnum))
  day: DaysEnum;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  from: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  to: Date;
}
