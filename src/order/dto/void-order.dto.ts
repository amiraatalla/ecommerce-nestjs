import {ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { IsObjectId } from "src/core/validators";
import { OrderStatusEnum } from "../enums/order-status.enum";
import { Types } from 'mongoose';
import { Transform } from "class-transformer";
import { toObjectId } from "src/core/utils";

export class VoidedOrderDto {

    @IsOptional()
    @IsEnum(OrderStatusEnum)
    @ApiProperty({ example: OrderStatusEnum.VOID })
    orderStatus: OrderStatusEnum;

  
}

