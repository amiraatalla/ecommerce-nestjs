import {ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { OrderStatusEnum } from "../enums/order-status.enum";
import { CreateOrderDto } from "./create-order.dto";
 
export class ActiveOnHoldOrderDto extends CreateOrderDto {

  
}

