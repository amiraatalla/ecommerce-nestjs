import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { SignUpDto } from '../../auth/dto/sign-up.dto';
import { RolesEnum } from '../enums/roles.enum';
export class UpdateUserDto extends PickType(SignUpDto, ['name', 'profilePicture', 'address'] as const) {
    @IsOptional()
    @IsString()
    @ApiProperty({ example: '+33700555378' })
    phoneNumber: string;

    @IsOptional()
    @IsEnum(RolesEnum)
    @ApiProperty({ example: RolesEnum.RESTURANT })
    role?: RolesEnum;
  

}
