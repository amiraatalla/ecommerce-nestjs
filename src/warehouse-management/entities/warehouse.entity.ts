import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';

export type WarehouseDoc = Warehouse & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Warehouse extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: true })
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false })
  inventoryManId: Types.ObjectId;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  address: string;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
