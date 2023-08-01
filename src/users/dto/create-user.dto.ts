import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/core/decorators';
import { SignUpDto } from '../../auth/dto/sign-up.dto';
import { RoleGroups, RolesEnum } from '../enums/roles.enum';

export class CreateUserDto extends PickType(SignUpDto, ['password'] as const) {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'hemedah94@gmail.com' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber: string;

  @IsIn(RoleGroups.ADMINSTRATION)
  @ApiProperty({ example: RolesEnum.SUPER_ADMIN })
  @IsNotEmpty()
  role: RolesEnum;
  
  @IsOptional()
  @IsStrongPassword()
  @ApiProperty({ example: 'P@ssw0rd' })
  pin: string;
}
