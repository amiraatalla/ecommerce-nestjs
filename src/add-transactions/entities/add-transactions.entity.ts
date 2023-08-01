import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { ItemDetails } from '../dto/create-add-transactions.dto';

export type AddTransactionsDoc = AddTransactions & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class AddTransactions extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: Supplier.name })
  supplierId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false })
  purchaseOrderId: Types.ObjectId;
  //header
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Date, required: true })
  date: Date;
  //details
  @Prop({ type: ItemDetails })
  items: ItemDetails[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const AddTransactionsSchema = SchemaFactory.createForClass(AddTransactions);
