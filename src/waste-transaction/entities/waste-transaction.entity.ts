import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { WasteItems } from '../dto/create-waste-transaction.dto';

export type WasteTransactionDoc = WasteTransaction & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class WasteTransaction extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;

  //header
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Date, required: true })
  date: Date;
  //details
  @Prop({ type: WasteItems })
  items: WasteItems[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const WasteTransactionSchema = SchemaFactory.createForClass(WasteTransaction);
