import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogsCSVDto {
  /**
   * Used to filter from date like 2022-01-01
   */
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '2022-01-01' })
  filterByDateFrom?: string;

  /**
   * Used to filter by to date like 2024-01-02
   */
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '2024-01-02' })
  filterByDateTo?: string;
}
