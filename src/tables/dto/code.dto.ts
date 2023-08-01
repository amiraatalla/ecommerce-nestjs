import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateTableDto } from './create-table.dto';


export class CodeDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'BFDS' })
  code?: string;


  
}

