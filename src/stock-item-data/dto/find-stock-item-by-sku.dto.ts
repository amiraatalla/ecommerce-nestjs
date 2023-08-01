import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import { Types } from 'mongoose';

export class FindStockItemBySKUDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  sku: string;

  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ example: "637f4dcf3ad3404a931a58d7" })
  entityId: Types.ObjectId;

}
