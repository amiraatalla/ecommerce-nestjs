import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'aws-sdk/clients/acm';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { SubscriptionTypeEnum } from 'src/users/enums/subscription-type.enum';
import { User } from 'src/users/entities/user.entity';

export class UpdatePackageDto {
 
  
  @IsNotEmpty()
  @IsArray()
  @IsObjectId({ each: true })
  @Transform(({ value }) => value.map((i: string) => toObjectId(i)))
  @ApiProperty({ type: [String] })
  users?: User[] | Object[];
 

}
