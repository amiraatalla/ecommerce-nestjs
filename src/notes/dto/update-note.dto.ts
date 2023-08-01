import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';


export class UpdateNoteDto{

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'write your notes  here' })
  notes?: string;

  
}

