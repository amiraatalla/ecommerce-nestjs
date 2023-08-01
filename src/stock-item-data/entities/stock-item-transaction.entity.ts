import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';

import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { BatchesTransactions } from '../classes/batches-transaction.class';
import { REFTRANSACTIONENUM } from '../enums/ref-transaction-enum';
import { StockItem } from './stock-item.entity';

export type StockItemTransactionsDoc = StockItemTransactions & Document;
@Schema({ timestamps: true, versionKey: false, id: false })
export class StockItemTransactions extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: true, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: StockItem.name })
  stockItemId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false })
  refTransactionId: Types.ObjectId;
  @Prop({ type: String, enum: REFTRANSACTIONENUM, required: true })
  transactionType: string;
  @Prop({ type: Number, required: true })
  qty: number;
  @Prop({ type: Number, required: true })
  qtyRemaining: number;
  @Prop({ type: Number, required: true })
  price: number;
  @Prop({ type: BatchesTransactions, required: false })
  batches: BatchesTransactions[];
}

export const StockItemTransactionsSchema = SchemaFactory.createForClass(
  StockItemTransactions,
);
