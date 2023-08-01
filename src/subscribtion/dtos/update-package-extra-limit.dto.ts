import { ApiProperty } from '@nestjs/swagger';
;
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdatePackageExtraLimitDto {
 
   @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @ApiProperty({example: 0})
    extraLimit?: number;

}
