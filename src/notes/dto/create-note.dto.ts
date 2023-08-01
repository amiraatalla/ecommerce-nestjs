import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
export class CreateNoteDto {
   
  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ type: String })
  customer: Types.ObjectId;
  
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'write your notes  here' })
  notes: string;
  
}
