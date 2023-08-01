import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { ReportOptions } from "./report-search.dto";

export class WasteReport extends OmitType(ReportOptions, ['dailyChart']) {
    // @IsOptional()
    // @IsBoolean()
    // @ApiProperty({ example: false})
    // itemWaste?: boolean
}