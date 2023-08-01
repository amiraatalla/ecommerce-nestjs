import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TypeEnum } from '../enums/type.enum';


export class CreateTutorialDto {
   

   @IsNotEmpty()
   @IsString()
   @ApiProperty({ example: 'vedio name' })
   name: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty({ example: 'vedio name' })
   url: string;


   @IsEnum(TypeEnum)
   @ApiProperty({ example: TypeEnum.RESTURANT})
   @IsNotEmpty()
   type: TypeEnum;

}


