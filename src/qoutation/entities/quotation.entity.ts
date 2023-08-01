import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from 'src/core/entities';
import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { ItemQuotation } from '../dto/create-item-quotation.dto';

export type QuotationDoc = Quotation & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Quotation extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref: User.name })
  userId: Types.ObjectId;
  @Prop({ type: String, required: true, ref: User.name})
  customerEmail: Types.ObjectId;
  @Prop({ type: ItemQuotation })
  itemsList: ItemQuotation[];
 
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation);
