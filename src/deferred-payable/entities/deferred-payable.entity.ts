import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Payable } from 'src/payable/entities/payable.entity';
import { PayableTransactionTypeEnum } from 'src/payable/enums/payable-transaction-type.enum';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';

export type DeferredPayableDoc = DeferredPayable & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class DeferredPayable extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: Supplier.name})
  supplierId: Types.ObjectId;
  // @Prop({ type: Types.ObjectId, required: true, ref: Payable.name})
  // payableId: Types.ObjectId;
  @Prop({ type: String,default: PayableTransactionTypeEnum.INTERNAL_NOTE, enum: Object.values(PayableTransactionTypeEnum), required:true })
  transactionType: PayableTransactionTypeEnum;
  @Prop({ type: Number, required: true , default: 0})
  deferredPayableAmount: number;
  @Prop({ type: String, required: false })
  notes: string;
  @Prop({ type: Number, required: false })
  transactionID: number;
 
}
export const DeferredPayableSchema = SchemaFactory.createForClass(DeferredPayable);
