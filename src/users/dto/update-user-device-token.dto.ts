import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDeviceTokenDto {
  @IsNotEmpty()
  @IsString()
  deviceToken: string;
}
