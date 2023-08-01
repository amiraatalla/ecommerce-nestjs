import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';

import { User } from 'src/users/entities/user.entity';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { ItemRelease } from '../dto/create-release-transactions.dto';

export type ReleaseTransactionsDoc = ReleaseTransactions & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class ReleaseTransactions extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  //header
  @Prop({ type: Types.ObjectId, required: false, ref: User.name })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: User.name })
  customerId: Types.ObjectId;
  @Prop({ type: Date, required: false, default: Date.now() })
  date: Date;
  // @Prop({ type: Number, required: true })
  // price: Number;
  //details
  @Prop({ type: ItemRelease })
  items: ItemRelease[];
  @Prop({ type: Number, required: false })
  ID: number;
}

export const ReleaseTransactionsSchema = SchemaFactory.createForClass(ReleaseTransactions);
