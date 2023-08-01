import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { Transform, Type } from 'class-transformer';
import {  CartItems } from './create-item.dto';

export class CreateCartDto {
  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({example:"637f4dcf3ad3404a931a58d7"})
  entityId: Types.ObjectId;

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({example:"635d16d0e238d2546541301b"})
  customerId: Types.ObjectId;

  @IsNotEmpty()
  @IsArray()
  @Type(() => CartItems)
  @ValidateNested({ each: true })
  @ApiProperty({type:[CartItems]})
  cartItems: CartItems[];
  
  
}
