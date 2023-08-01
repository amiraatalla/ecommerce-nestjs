import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { NameLocalized } from 'src/stock-item-data/dto/create-stockitem.dto';

export class Item {
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
  @IsNumber()
  @Min(0)
  unitPrice?:number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalUnitPrice?:number; 
  
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ApiProperty()
  @Type(() => NameLocalized)
  @ValidateNested({ each: true })
  nameLocalized: NameLocalized;

  @IsOptional()
  @IsString()
  @ApiProperty({example: 'img url'})
  img?:string;

  
}
