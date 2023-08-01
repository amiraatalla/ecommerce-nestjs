import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsObject } from 'class-validator';
import { SearchOptions } from 'src/core/shared';

export class StockItemSearchOptions extends SearchOptions {
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ApiProperty({ example: [] })
  filterByWarehouse?: Record<string, any>[] = [];
}