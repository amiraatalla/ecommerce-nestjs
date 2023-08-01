import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { IsStrongPassword, IsStrongPin } from 'src/core/decorators';
import { PricingEnum } from 'src/subscribtion/enum/pricing.enum';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { SubscriptionTypeEnum } from 'src/users/enums/subscription-type.enum';

export class SignUpDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'hemedah94@gmail.com' })
  @IsNotEmpty()
  email: string;

  /** Password must be at least 8 characters and include one lowercase letter, one uppercase letter, and one digit. */
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;

    /** Pin must be at least 8 characters and include one lowercase letter, one uppercase letter, and one digit. */
    @IsNotEmpty()
    @IsStrongPin()
    @ApiProperty({ example: 'P@ssw0rd' })
    pin: string;

  @IsIn(RoleGroups.BUSSINESS_CUSTOMER)
  @ApiProperty({ example: RolesEnum.RESTURANT })
  @IsNotEmpty()
  role: RolesEnum;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Abdallah Hemedah' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'cairo str.' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'image url' })
  profilePicture?: string

  @ValidateIf(
    (value) =>
      value.role == RolesEnum.RESTURANT || value.role == RolesEnum.MERCHANT,
  )
  @IsNotEmpty()
  @IsEnum(SubscriptionTypeEnum)
  @ApiProperty({ example: SubscriptionTypeEnum.CASHIER })
  subscriptionType: SubscriptionTypeEnum;

  @ValidateIf(
    (value) =>
      value.role == RolesEnum.RESTURANT || value.role == RolesEnum.MERCHANT,
  )
  @IsEnum(PricingEnum)
  @IsNotEmpty()
  @ApiProperty({ example:PricingEnum.QUARTERLY })
  pricing: PricingEnum;

  @ValidateIf(
    (value) =>
      value.role == RolesEnum.RESTURANT || value.role == RolesEnum.MERCHANT,
  )
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  registrationNumber: string;

  @ValidateIf(
    (value) =>
      value.role == RolesEnum.RESTURANT || value.role == RolesEnum.MERCHANT,
  )
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  taxID: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({example: 0})
  extraLimit?: number;

}
