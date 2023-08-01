import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateIsFeaturesDto{


  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isFeatures?:boolean;
}

