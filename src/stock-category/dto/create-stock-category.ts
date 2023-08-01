import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';

export class CreateStockCategoryDto {
  @ApiProperty({ type: String })
  @IsString()
  stockategoryName: string;

  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})
  parentStockategoryId?: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  department?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  section?: boolean;
}
