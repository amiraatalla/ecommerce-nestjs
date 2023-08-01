import { ApiProperty } from '@nestjs/swagger';
import { IsEnum,IsOptional, IsString } from 'class-validator';
import { TypeEnum } from '../enums/type.enum';


export class UpdateTutorialDto {

   @IsOptional()
   @IsString()
   @ApiProperty({ example: 'vedio name' })
   name: string;

   @IsOptional()
   @IsString()
   @ApiProperty({ example: 'vedio name' })
   url: string;


   @IsOptional()
   @IsEnum(TypeEnum)
   @ApiProperty({ example: TypeEnum })
   type: TypeEnum;


}

