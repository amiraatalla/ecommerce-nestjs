import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SigninDto {
  @IsNotEmpty()
  @IsEmail() 
  @ApiProperty({ example: 'hemedah94@gmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;
}
