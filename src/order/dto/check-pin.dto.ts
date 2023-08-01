import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';

export class CheckPinDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "P@ssw0rd"})
  pin: string;

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ example: "637f4ce83ad3404a931a58c2" })
  ownerId: Types.ObjectId;

}
