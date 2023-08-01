import { ApiProperty, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Types } from "mongoose";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { IsObjectId } from "src/core/validators";
import { CartItems } from "./create-item.dto";


export class UpdateCartDto {

    @IsOptional()
    @IsObjectId()
    @ApiProperty({ example: "637f4dcf3ad3404a931a58d7" })
    entityId?: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @Type(() => CartItems)
    @ValidateNested({ each: true })
    @ApiProperty({ type: [CartItems] })
    cartItems?: CartItems[];
}

