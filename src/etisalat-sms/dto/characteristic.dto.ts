import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';

export class Characteristic {

  @IsNotEmpty()
  @IsString()
  @ApiProperty({example: "body"})
  name :string; 
  

  @IsNotEmpty()
  @IsString()
  @ApiProperty({example: "Hello to Etisalat world"})
  value :string; 
  
}
