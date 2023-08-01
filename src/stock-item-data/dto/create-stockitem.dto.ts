import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toObjectId } from 'src/core/utils';
import { IsObjectId } from 'src/core/validators';
import { PricingMethod } from '../enums/pricing-methods';
import { StockItemTypeEnum } from '../enums/stock-item-type';
import { UnitsEnum } from '../enums/units.enum';

export class NameLocalized {
  @ApiProperty()
  @IsString()
  mainLanguage: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  secondLanguage: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  thirdLanguage: string;
}

export class CreateStockItemDto {
  //@ValidateByAliasType('name')
  @ApiProperty()
  @Type(() => NameLocalized)
  @ValidateNested({ each: true })
  nameLocalized: NameLocalized;
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
  // @ValidateByAliasType('type')
  @ApiProperty()
  @IsOptional()
  @IsString()
  parLevel?: string;
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  minQty?: number;
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  maxQty?: number;
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  minQtyAlert?: number;
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  maxQtyAlert?: number;
  @ApiProperty()
  @IsPositive()
  reOrderPoint: number;
  @IsOptional()
  @IsPositive()
  qtyToOrder?: number;
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  purchasePrice?: number;
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  sellingPrice?: number;
  @ApiProperty()
  @IsOptional()
  @IsString()
  picture?: string;
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  unCodedItem?: boolean;
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  trackExpiry?: boolean;
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  trackBatches?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, default: '' })
  sku?: string;
  @IsIn(Object.values(StockItemTypeEnum))
  @ApiProperty({ enum: StockItemTypeEnum, default: StockItemTypeEnum.CONSUMABLES })
  type: StockItemTypeEnum;

  @IsString()
  @IsIn(Object.values(UnitsEnum))
  @ApiProperty({ enum: UnitsEnum, default: UnitsEnum.KILOGRAM })
  storageUnit: UnitsEnum;
  @IsString()
  @IsIn(Object.values(PricingMethod))
  @ApiProperty({ enum: PricingMethod, default: PricingMethod.FIFO })
  pricingMethod: PricingMethod;

  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  
  warehouseId: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String}) 
  stockCategoryId?: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) => toObjectId(value))
  @ApiProperty({ type: String})  
  preferredSupplierId?: Types.ObjectId;


  @IsOptional()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  slowMoving?: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  expectedMonthlyQtySold?: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;
  
}

// const model = new CreateStockItemDto();
// export function ValidateByAliasType(
//   property: string,
//   validationOptions?: ValidationOptions,
// ) {
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'validateByAliasType',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [property],
//       options: validationOptions,
//       validator: {
//         validate(value: any, args: ValidationArguments) {
//           const [relatedPropertyName] = args.constraints;
//           const relatedValue = (args.object as any)[relatedPropertyName];
//           if (relatedValue === model.branchId) {
//             return isObjectId(value) ;
//           }
//           // if (relatedValue === model.type) {
//           //   return IsIn(StockItemTypeEnum);
//           // }
//           // if (relatedValue === CA_DetailsTypes.MOBILE) {
//           //   return value.length === 11;
//           // }
//           // if (relatedValue === CA_DetailsTypes.TXT) {
//           //   return value.length > 3 && value.length <= 99;
//           // }
//           return false;
//         },
//         defaultMessage(args?: ValidationArguments) {
//           const [relatedPropertyName] = args.constraints;
//           const relatedValue = (args.object as any)[relatedPropertyName];
//           switch (relatedValue) {
//             case model.branchId:
//               return 'Please enter valid object id!';

//             case model.name:
//               return 'Please enter valid name!';

//             // case CreateStockItemDto.CNIC:
//             //   return 'Please enter valid CNIC!';

//             default:
//               return 'Invalid value!';
//           }
//         },
//       },
//     });
//   };
// }
