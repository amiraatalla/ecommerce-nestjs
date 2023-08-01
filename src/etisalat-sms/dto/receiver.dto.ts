import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';

export class Receiver {

 
  @IsNotEmpty()
  @IsString()
  @ApiProperty({example: "201117008874"})
  phoneNumber :string; 
  
}
