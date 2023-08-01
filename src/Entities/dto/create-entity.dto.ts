import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {  IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Max, Min, ValidateNested } from 'class-validator';
import { Schedule } from '../classes/schedule.class';
import { EntityTypeEnum } from '../enum/entity-type.enum';

export class CreateEntitiesDto {

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'resturant name' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'restuarant address' })
  address: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'image url' })
  logo?: string
  /**
  * Google maps url for the store location.
  * @example https://goo.gl/maps/L5eMZ7QpyN4T5bN37
  */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://goo.gl/maps/L5eMZ7QpyN4T5bN37' })
  googleMapUrl?: string;

  /**
 * @example https://www.facebook.com
 */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.facebook.com' })
  facebookUrl?: string;

  /**
  * @example https://www.instgram.com
  */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.instgram.com' })
  instgramUrl?: string;

  /**
    * @example https://www.twitter.com
    */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.twitter.com' })
  twitterUrl?: string;

  /**
    * @example https://www.youtube.com
    */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.youtube.com' })
  youtubeUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vat: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  service: number;


  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyTarget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weeklyTarget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyTarget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearlyTarget: number;

  @IsOptional()
  @Type(() => Schedule)
  @IsArray()
  @ValidateNested({ each: true })
  schedule?: Schedule[];
}

