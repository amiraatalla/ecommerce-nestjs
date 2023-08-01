import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { NotificationData } from '../classes/notification-data.class';

export class CreateNotificationDto {
 
 
  @IsNotEmpty()
  @Type(() => NotificationData)
  @ValidateNested()
  @ApiProperty()
  notificationData: NotificationData;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  allCustomers: boolean = false;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  allBusinessOwners: boolean = false;
 
  @ValidateIf(
    (value) =>
      value.allCustomers == false &&  value.allBusinessOwners ==false
  )
  @IsNotEmpty()
  @IsObjectId({ each: true })
  @Transform(({ value }) => toObjectId(value))
  @IsArray()
  @ApiProperty()
  userIds: Types.ObjectId[];



}
