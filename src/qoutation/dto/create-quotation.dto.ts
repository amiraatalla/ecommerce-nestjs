import { ApiProperty } from '@nestjs/swagger';
import {  IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { NameLocalized } from 'src/stock-item-data/dto/create-stockitem.dto';
import { ItemQuotation } from './create-item-quotation.dto';

export class CreateQuotationDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'hemedah94@gmail.com' })
  @IsNotEmpty()
  customerEmail: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => ItemQuotation)
  @ValidateNested({ each: true })
  @ApiProperty({type:[ItemQuotation]})
  itemsList: ItemQuotation[];
  
}
