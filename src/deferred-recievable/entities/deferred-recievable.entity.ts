import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Customer } from 'src/customer/entities/customer.entity';
import { Recievable } from 'src/receivable/entities/recievable.entity';
import { RecievableTransactionTypeEnum } from 'src/receivable/enums/recievable-transaction-enum';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';

export type DeferredRecievableDoc = DeferredRecievable & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class DeferredRecievable extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true, ref: User.name})
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: Customer.name})
  customerId: Types.ObjectId;
  // @Prop({ type: Types.ObjectId, required: true, ref: Recievable.name})
  // recievableId: Types.ObjectId;
  @Prop({ type: String,default: RecievableTransactionTypeEnum.INTERNAL_NOTE, enum: Object.values(RecievableTransactionTypeEnum), required:true })
  transactionType: RecievableTransactionTypeEnum;
  @Prop({ type: Number, required: true , default: 0})
  deferredRecievableAmount: number;
  @Prop({ type: String, required: false })
  notes: string;
  @Prop({ type: Number, required: false })
  transactionID: number;
}
export const DeferredRecievableSchema = SchemaFactory.createForClass(DeferredRecievable);
