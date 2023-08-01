import {ApiProperty, PickType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { OrderTypeEnum } from "../enums/order-type.enum";
import { PaymentMethodEnum } from "../enums/payment-method.enum";

export class UpdateOrderDto {

    @IsOptional()
    @IsEnum(OrderTypeEnum)
    @ApiProperty({ example:OrderTypeEnum.PHYSICAL})
    orderType: OrderTypeEnum;
  
  
    @IsOptional()
    @IsEnum(PaymentMethodEnum)
    @ApiProperty({ example:PaymentMethodEnum.CASH})
    paymentMethod: PaymentMethodEnum;
}

