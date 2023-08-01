import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateEntitiesDto } from './create-entity.dto';


export class UpdateEntitiesDto extends PickType(CreateEntitiesDto, ['googleMapUrl','facebookUrl','instgramUrl','twitterUrl', 'youtubeUrl', 'vat' ,'service', 'logo', 'schedule', 'dailyTarget', 'weeklyTarget','monthlyTarget', 'yearlyTarget'] as const){


  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Resturant name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'store address' })
  address?: string;
 
 
}

