import {ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, Min } from "class-validator";
import { Types } from 'mongoose';
import { IsObjectId } from "src/core/validators";


export class AddItemDto {

    @ApiProperty({ example: "637f4dcf3ad3404a931a58d7" })
    entityId?: Types.ObjectId;

    @IsOptional()
    @IsObjectId()
    @ApiProperty({ example:'637f604deeb74c2c74e5b2c6' })
    stockItemId?: Types.ObjectId;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    @ApiProperty({example: 0})
    qty?:number;  
}

