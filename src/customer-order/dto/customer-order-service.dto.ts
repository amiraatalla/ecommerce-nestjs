import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class  CustomerOrderServices {
  @IsOptional()
  @IsObjectId()
  @ApiProperty({ example:'637f5d2ceeb74c2c74e5b2af' })
  serviceId?: Types.ObjectId;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  qty?:number;

  @IsOptional()
  @IsString()
  @ApiProperty({example: "party"})
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  sellingPrice?:number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  itemTotal?:number; 
  
  @IsOptional()
  @IsString()
  @ApiProperty({example: "notes"})
  notes?: string;

 
  
}
