import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { CurrencyCodeEnum } from '../enums/currency-code.enum';
import { LanguageEnum } from '../enums/language.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { CardItem } from './card-item.dto';


export class PayAtFawryDto {


  @IsString()
  merchantRefNum:string;

  @IsString()
  @IsEnum(CurrencyCodeEnum)
  currencyCode: CurrencyCodeEnum;

  @IsString()
  @IsEnum(LanguageEnum)
  language: LanguageEnum;

  @IsNumber()
  amount: number;

  @IsString()
  cardNumber: string;

  @IsString()
  cardExpiryYear: string;

  @IsString()
  cardExpiryMonth: string;

  @IsString()
  cvv: string;

  @IsString()
  description: string;

  @IsArray()
  @Type(() => CardItem)
  @ValidateNested({ each: true })
  @ApiProperty({type:[CardItem]})
  chargeItems: CardItem[];
  

    
}
