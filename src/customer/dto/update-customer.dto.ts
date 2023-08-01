import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';


export class UpdateCustomerDto extends PickType(CreateCustomerDto, ['address','city','state', 'country', 'phoneTwo'] as const){

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+3334444' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+3334444' })
  phoneOne?: string;
  
}

