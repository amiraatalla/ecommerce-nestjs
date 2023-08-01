import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { PayableTransactionTypeEnum } from '../enums/payable-transaction-type.enum';

export type PayableDoc = Payable & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Payable extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: Supplier.name})
  supplierId: Types.ObjectId;
  @Prop({ type: String,default: PayableTransactionTypeEnum.INTERNAL_NOTE, enum: Object.values(PayableTransactionTypeEnum), required:true })
  transactionType: PayableTransactionTypeEnum;
  @Prop({ type: Number, required: true , default: 0})
  payableAmount: number;
  @Prop({ type: String, required: false })
  notes: string;
  @Prop({ type: Number, required: false })
  transactionID: number;
 
}
export const PayableSchema = SchemaFactory.createForClass(Payable);
