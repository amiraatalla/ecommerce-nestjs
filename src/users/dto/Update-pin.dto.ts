import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { IsStrongPassword } from "src/core/decorators";

export class UpdatePinDto{
 
  @IsOptional()
  @IsStrongPassword()
  @ApiProperty({ example: 'NewP@ssw0rd' })
  pin: string;
}