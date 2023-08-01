import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import {  Type } from 'class-transformer';
import { OrderTypeEnum } from '../enums/order-type.enum';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { CustomerOrderServices } from './customer-order-service.dto';
import { CustomerItem } from './create-customer-item.dto';

export class CreateCustomerOrderDto {
  @IsOptional()
  @IsObjectId()
  @ApiProperty({example:"637f4dcf3ad3404a931a58d7"})
  entityId?: Types.ObjectId;

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({example:"63b6837bdd04604245229878"})
  customerId: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(OrderTypeEnum)
  @ApiProperty({ example:OrderTypeEnum.E_COMMERCE})
  orderType: OrderTypeEnum;

  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  @ApiProperty({ example: OrderStatusEnum.ONHOLD })
  orderStatus: OrderStatusEnum;

  @IsOptional()
  @IsArray()
  @Type(() => CustomerItem)
  @ValidateNested({ each: true })
  @ApiProperty({type:[CustomerItem]})
  items?: CustomerItem[];

  @IsOptional()
  @IsArray()
  @Type(() => CustomerOrderServices)
  @ValidateNested({ each: true })
  @ApiProperty({type:[CustomerOrderServices]})
  services?: CustomerOrderServices[];

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
 
  @IsOptional()
  @IsBoolean()
  @ApiProperty({example:"false"})
  isOnline? : boolean;

  @ValidateIf(val => val.isOnline == true)
  @IsNotEmpty()
  @IsString()
  @ApiProperty({example:"address"})
  deliveryAddress?: string;  

  @IsOptional()
  @IsString()
  @ApiProperty({example:"ACDS"})
  tableCode: string;

}
