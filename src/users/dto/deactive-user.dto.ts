import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class DeactiveUserDto {
  @IsBoolean()
  @ApiProperty()
  @IsNotEmpty()
  active:boolean;
}
