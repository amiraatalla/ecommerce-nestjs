import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';

import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { Items } from '../dto/audit-transactions.dto';

export type AuditTransactionsDoc = AuditTransactions & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class AuditTransactions extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;

  //header
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Date, required: true })
  date: Date;
  //details
  @Prop({ type: Items })
  items: Items[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const AuditTransactionsSchema = SchemaFactory.createForClass(AuditTransactions);
