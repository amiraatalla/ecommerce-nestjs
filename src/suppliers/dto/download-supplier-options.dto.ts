import { OmitType } from "@nestjs/swagger";
import { SearchOptions } from "src/core/shared";

export class DownloadSupplierSearchOptions extends OmitType(SearchOptions, ['offset','size'] as const){
}