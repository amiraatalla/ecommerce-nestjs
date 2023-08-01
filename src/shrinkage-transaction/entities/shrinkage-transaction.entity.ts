import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';

import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { ShrinkageItems } from '../dto/create-shrinkage-transaction.dto';

export type ShrinkageTransactionDoc = ShrinkageTransaction & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class ShrinkageTransaction extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;

  //header
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Date, required: true })
  date: Date;
  //details
  @Prop({ type: ShrinkageItems })
  items: ShrinkageItems[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const ShrinkageTransactionSchema = SchemaFactory.createForClass(ShrinkageTransaction);
