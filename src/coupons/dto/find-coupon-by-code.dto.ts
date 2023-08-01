import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsString} from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';

export class FindCuoponByCodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({example:"635d16d0e238d2546541301b"})
  customerId: Types.ObjectId;
}
