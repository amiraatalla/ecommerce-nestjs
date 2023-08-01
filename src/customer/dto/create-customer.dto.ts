import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
export class CreateCustomerDto {

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: ' hemada abdallah' })
  name: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({ example: ' hmd123' })
  // customerCode:string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Customer address' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Maadi' })
  city?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Egypt' })
  state?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Cairo' })
  country?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '+33333333' })
  phoneOne?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+3334444' })
  phoneTwo?: string;

  // @IsOptional()
  // @IsString()
  // @ApiProperty({ example: 'write your notes  here' })
  // notes?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  receivePromotionalMessagesOrDiscounts: boolean;

  // @IsOptional()
  // @IsObjectId()
  // @ApiProperty({ type: String })
  // entityGuestId?: Types.ObjectId;

}
