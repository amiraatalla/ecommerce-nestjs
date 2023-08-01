import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SubscriptionTypeEnum } from 'src/users/enums/subscription-type.enum';
import { PricingEnum } from '../enum/pricing.enum';
export class UpdatePackageTypeDto {
 
  @IsNotEmpty()
  @IsEnum(SubscriptionTypeEnum)
  @ApiProperty({ example: SubscriptionTypeEnum.CASHIER })
  subscriptionType: SubscriptionTypeEnum;

  @IsNotEmpty()
  @IsEnum(PricingEnum)
  @ApiProperty({ example: PricingEnum.QUARTERLY })
  pricing: PricingEnum;


}
