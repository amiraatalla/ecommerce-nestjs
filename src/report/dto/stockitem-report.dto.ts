import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsObject, IsOptional } from "class-validator";
import { ReportOptions } from "./report-search.dto";

export class StockItemReport extends OmitType(ReportOptions, ['dailyChart']) {
    @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ApiProperty({ example: [] })
  filterByWarehouse?: Record<string, any>[] = [];
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: false})
    itemStockLevels?: boolean
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: false})
    outOfStockItems?: boolean
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: false})
    margin?: boolean
}