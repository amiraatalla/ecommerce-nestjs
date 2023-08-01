import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { ItemRelease } from 'src/release-transactions/dto/create-release-transactions.dto';

import { Supplier } from 'src/suppliers/entities/suppliers.entity';

import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';

export type ReverseTransactionsDoc = ReverseTransactions & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class ReverseTransactions extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: Supplier.name })
  supplierId: Types.ObjectId;
  //header
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Date, required: true })
  date: Date;
  @Prop({ type: Number, required: true })
  price: number;
  //details
  @Prop({ type: ItemRelease })
  items: ItemRelease[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const ReverseTransactionsSchema = SchemaFactory.createForClass(ReverseTransactions);
