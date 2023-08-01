import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { NameLocalized } from 'src/stock-item-data/dto/create-stockitem.dto';

export class CustomerItem {
  @IsOptional()
  @IsObjectId()
  @ApiProperty({ example:'637f6099eeb74c2c74e5b2d2' })
  stockItemId?: Types.ObjectId;


  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  qty?:number;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  sku: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example: 'https://cauris.s3.eu-west-3.amazonaws.com//assets/db72940c-0112-4776-9057-22cde7ea7c70.jpeg'})
  img?:string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  sellingPrice:number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  itemTotal:number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ApiProperty()
  @Type(() => NameLocalized)
  @ValidateNested({ each: true })
  nameLocalized: NameLocalized;
  
}
