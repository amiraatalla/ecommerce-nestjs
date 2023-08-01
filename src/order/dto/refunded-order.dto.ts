import {ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { IsObjectId } from "src/core/validators";
import { OrderStatusEnum } from "../enums/order-status.enum";
import { Item } from "./create-item.dto";
import { Types } from 'mongoose';
import { toObjectId } from "src/core/utils";
import { ReturnMethodEnum } from "../enums/return-method.enum";
import { OrderServices } from "./order-service.dto ";

export class RefundedOrderDto {

    @IsOptional()
    @IsEnum(ReturnMethodEnum)
    @ApiProperty({ example: ReturnMethodEnum.PARTIALLY })
    refundMethod: ReturnMethodEnum;

    @ValidateIf(val => val.refundMethod ==ReturnMethodEnum.PARTIALLY)
    @IsNotEmpty()
    @IsArray()
    @Type(() => Item)
    @ValidateNested({ each: true })
    @ApiProperty({type:[Item]})
    items: Item[];

    @IsOptional()
    @IsArray()
    @Type(() => OrderServices)
    @ValidateNested({ each: true })
    @ApiProperty({type:[OrderServices]})
    services?: OrderServices[];

    @ValidateIf(val => val.refundMethod ==ReturnMethodEnum.PARTIALLY)
    @IsNotEmpty()
    @IsArray()
    @Type(() => Item)
    @ValidateNested({ each: true })
    @ApiProperty({type:[Item]})
    refundedItems: Item[];


    @IsOptional()
    @IsArray()
    @Type(() => OrderServices)
    @ValidateNested({ each: true })
    @ApiProperty({type:[OrderServices]})
    refundedServices?: OrderServices[];

    @IsOptional()
    @IsString()
    @ApiProperty({ example: "P@ssw0r"})
    pin?: string;

}

