import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { RecievableTransactionTypeEnum } from '../enums/recievable-transaction-enum';

export type RecievableDoc = Recievable & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Recievable extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: Customer.name })
  customerId: Types.ObjectId;
  @Prop({ type: String, default: RecievableTransactionTypeEnum.INTERNAL_NOTE, enum: Object.values(RecievableTransactionTypeEnum), required: true })
  transactionType: RecievableTransactionTypeEnum;
  @Prop({ type: Number, required: true, default: 0 })
  recievableAmount: number;
  @Prop({ type: String, required: false })
  notes: string;
  @Prop({ type: Number, required: false })
  transactionID: number;

}
export const RecievableSchema = SchemaFactory.createForClass(Recievable);
