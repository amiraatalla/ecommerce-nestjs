import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class ForgetPasswordDto{
    @IsEmail()
    @Transform(({value})=>value.toLowerCase())
    @ApiProperty({example: 'super@gmail.com'})
    email:string;
}