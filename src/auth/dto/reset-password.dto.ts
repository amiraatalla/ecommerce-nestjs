import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { randomBytes } from 'crypto';
import { IsStrongPassword } from '../../core/decorators';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({example: '123456'})
  code: string;

  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({ example: 'newP@ssw0rd' })
  newPassword: string;
}
