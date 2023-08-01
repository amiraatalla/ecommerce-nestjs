import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';

export class CardItem {
  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ example:'636776787c249f3f81fe08b9' })
  itemId: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  // @IsString()
  @ApiProperty({example: 0})
  quantity :number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price :number;

  @IsOptional()
  @IsString()
  description :string; 
  
}
