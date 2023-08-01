import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, MaxLength, ValidateNested } from 'class-validator';
import { MessageTypeEnum } from '../enums/message-type.enum';
import { Characteristic } from './characteristic.dto';
import { Receiver } from './receiver.dto';


export class CreateEtisalatSMS {


  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  @ApiProperty({example:"52248aec-022c-6d53-eabe-306d53eabe30"})
  id:string;

  @IsString()
  @IsOptional()
  @IsEnum(MessageTypeEnum)
  @ApiProperty({example:"SMS"})
  messageType?: MessageTypeEnum = MessageTypeEnum.SMS;

  @IsArray()
  @Type(() => Characteristic)
  @ValidateNested({ each: true })
  @ApiProperty({type:[Characteristic]})
  characteristic: Characteristic[];
  

  @IsArray()
  @Type(() => Receiver)
  @ValidateNested({ each: true })
  @ApiProperty({type:[Receiver]})
  receiver: Receiver[];
  
    
}
