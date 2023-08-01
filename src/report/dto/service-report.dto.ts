import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsObject, IsOptional } from "class-validator";

export class ServiceReportOptions {
    @IsOptional()
    @IsArray()
    @IsObject({ each: true })
    @ApiProperty({ example: [] })
    filterBy?: Record<string, any>[] = [];
    @IsOptional()
    @IsBoolean()
    topRecords?: boolean
}