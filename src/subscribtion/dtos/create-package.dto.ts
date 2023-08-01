import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class CreatePackageDto{

    // @IsOptional()
    // @IsNumber()
    // @Min(0)
    // @ApiProperty({example: 0})
    // extraLimit?: number;

}