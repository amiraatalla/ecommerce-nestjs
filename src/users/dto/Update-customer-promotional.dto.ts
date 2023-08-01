import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateCustomerPromotionalDto{
 
 
  @IsBoolean()
  @ApiProperty({ example: false })
  receivePromotionalMessagesOrDiscounts: boolean;

}