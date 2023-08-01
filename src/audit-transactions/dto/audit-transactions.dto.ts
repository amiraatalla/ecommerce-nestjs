import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { SelectiveTtemBatches } from 'src/reverse-transaction/dto/create-reverse-transaction.dto';
import { AuditTypeEnum } from '../enums/audit-type.enum';

export class Items {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  stockItemId: Types.ObjectId;
  @IsPositive()
  adjustment: number;
  @IsOptional()
  @IsPositive()
  price?: number;
  @IsOptional()
  @IsString()
  @IsIn(Object.values(AuditTypeEnum))
  auditType?: AuditTypeEnum;
  @IsOptional()
  @IsArray()
  @Type(() => SelectiveTtemBatches)
  @ValidateNested({ each: true })
  batches?: SelectiveTtemBatches[];
  @IsOptional()
  @IsString()
  note?: string;
}
export class CreateAuditTransactionsDto {
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  warehouseId: Types.ObjectId;
  @IsDateString()
  date: Date;
  @IsArray()
  @Type(() => Items)
  @ValidateNested({ each: true })
  items: Items[];
}
