import { OmitType } from "@nestjs/swagger";
import { SearchOptions } from "src/core/shared";
export class TransactionSearchOptions extends OmitType(SearchOptions, ['searchTerm'] as const) {}

