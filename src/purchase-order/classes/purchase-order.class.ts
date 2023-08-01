import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsPositive } from "class-validator";
import { Types } from "mongoose";
import { toObjectId } from "src/core/utils";
import { IsObjectId } from "src/core/validators";

export class PurchaseOrderClass {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String })
  stockItemId: Types.ObjectId;
  @IsPositive()
  qtyToOrder: number;
  @IsPositive()
  purchasePrice: number;
}