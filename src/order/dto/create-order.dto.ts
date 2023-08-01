import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { Transform, Type } from 'class-transformer';
import { OrderTypeEnum } from '../enums/order-type.enum';
import {  Item } from './create-item.dto';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { OrderServices } from './order-service.dto ';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({example:"6390af41d41122d9d65eb640"})
  customerId: Types.ObjectId;

  @IsOptional()
  @IsString()
  @ApiProperty({example:"AXYC"})
  tableCode: string;

  @IsNotEmpty()
  @IsEnum(OrderTypeEnum)
  @ApiProperty({ example:OrderTypeEnum.PHYSICAL})
  orderType: OrderTypeEnum;

  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  @ApiProperty({ example: OrderStatusEnum.ACTIVE })
  orderStatus: OrderStatusEnum;

  @IsOptional()
  @IsArray()
  @Type(() => Item)
  @ValidateNested({ each: true })
  @ApiProperty({type:[Item]})
  items?: Item[];

  @IsOptional()
  @IsArray()
  @Type(() => OrderServices)
  @ValidateNested({ each: true })
  @ApiProperty({type:[OrderServices]})
  services?: OrderServices[];

  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  @ApiProperty({ example:PaymentMethodEnum.CASH})
  paymentMethod: PaymentMethodEnum;
 
  @ValidateIf(val => val.paymentMethod == PaymentMethodEnum.OTHER)
  @IsNotEmpty()
  @IsString()
  methodName: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  
}
