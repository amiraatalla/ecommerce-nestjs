import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ItemDetails } from 'src/add-transactions/dto/create-add-transactions.dto';
import { Entities } from 'src/Entities/entities/entities.entity';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';

export type RefundTransactionDoc = RefundTransaction & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class RefundTransaction extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;
  //header
  @Prop({ type: Types.ObjectId, required: true, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Date, required: true })
  date: Date;
  @Prop({ type: Number, required: false })
  price: Number;
  //details
  @Prop({ type: ItemDetails })
  items: ItemDetails[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const RefundTransactionSchema = SchemaFactory.createForClass(RefundTransaction);
