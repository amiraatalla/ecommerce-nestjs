import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ActivateCuoponDto {
 
  @IsBoolean()
  @ApiProperty()
  @IsNotEmpty()
  status:boolean;
}
