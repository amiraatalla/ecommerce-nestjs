import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StockCategory } from 'src/stock-category/entities/stock-category.entity';

import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { NameLocalized } from '../dto/create-stockitem.dto';
import { PricingMethod } from '../enums/pricing-methods';
import { StockItemTypeEnum } from '../enums/stock-item-type';
import { Entities } from 'src/Entities/entities/entities.entity';
import { UnitsEnum } from '../enums/units.enum';

export type StockItemDoc = StockItem & Document;
export type WarehouseStockItemsDoc = WarehouseStockItems & Document;

@Schema({ timestamps: true, versionKey: false, id: true })
export class WarehouseStockItems extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false })
  preferredSupplierId: Types.ObjectId;
  @Prop({ type: Number, required: false, default: 0 })
  qtyOnHand?: number;
  @Prop({ type: Number, required: false, default: 0 })
  qtyOnHold?: number;
  @Prop({ type: Number, required: false })
  minQty: number;
  @Prop({ type: Number, required: false })
  maxQty: number;
  @Prop({ type: Number, required: false })
  minQtyAlert: number;
  @Prop({ type: Number, required: false })
  maxQtyAlert: number;
  @Prop({ type: Number, required: false })
  reOrderPoint: number;
  @Prop({ type: Number, required: false })
  qtyToOrder: number;
  @Prop({ type: Number, required: false })
  purchasePrice: number;
  @Prop({ type: Number, required: false })
  sellingPrice: number;
  @Prop({ type: String, required: false })
  parLevel: string;
}

@Schema({ timestamps: true, versionKey: false, id: false })
export class StockItem extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: StockCategory.name })
  stockCategoryId: Types.ObjectId;
  @Prop({ type: String, required: false })
  description: string;
  @Prop({ type: NameLocalized, required: true })
  nameLocalized: NameLocalized;
  @Prop({ type: String, required: false })
  stockItemCode: string;
  @Prop({ type: String, required: false })
  sku: string;
  @Prop({ type: String,enum: UnitsEnum, required: true, default: UnitsEnum.KILOGRAM })
  storageUnit: string;
  @Prop({ type: String,enum: StockItemTypeEnum, required: true, default: StockItemTypeEnum.CONSUMABLES })
  type: StockItemTypeEnum;
  @Prop({ type: String, required: false })
  picture: string;
  @Prop({ type: Boolean, required: false })
  unCodedItem: boolean;
  @Prop({ type: Boolean, required: false })
  trackExpiry: boolean;
  @Prop({ type: Boolean, required: false })
  trackBatches: boolean;
  @Prop({ type: Object, required: false })
  warehousestockitem: any;
  @Prop({ type: String, required: true, default: PricingMethod.FIFO })
  pricingMethod: PricingMethod;
  @Prop({ type: [Types.ObjectId], required: false, ref: WarehouseStockItems.name })
  warehouseStockItemsData: Types.ObjectId[];
  @Prop({ type: Number, required: false })
  slowMoving: number;
  @Prop({ type: Number, required: false })
  expectedMonthlyQtySold :number;
  @Prop({ type: Number, required: false })
  dailyBudget :number;

  @Prop({type:Boolean, default: false ,required: false})
  isFeatures : boolean;
}

export const WarehouseStockItemsSchema = SchemaFactory.createForClass(WarehouseStockItems);
export const StockItemSchema = SchemaFactory.createForClass(StockItem);
