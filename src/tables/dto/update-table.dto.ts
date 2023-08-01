import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateTableDto } from './create-table.dto';


export class UpdateTableDto extends PickType(CreateTableDto, [
  'name','area','seats','status'
]){

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'BFDS' })
  code?: string;


  
}

