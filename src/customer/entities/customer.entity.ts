import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { generateCode } from 'src/core/utils';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { BaseEntity } from '../../core/entities';


export type CustomerDoc = Customer & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Customer extends BaseEntity {

  @Prop({ type: [Types.ObjectId], required: true })
  owner: Types.ObjectId[];
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, default: RolesEnum.CUSTOMER, enum: Object.values(RolesEnum) })
  role: RolesEnum;
  @Prop({ type: String, required: true, unique: true, set: (value: string) => generateCode(value) })
  customerCode: string;
  @Prop({ type: String, required: false })
  address: string;
  @Prop({ type: String, required: false })
  city: string;
  @Prop({ type: String, required: false })
  state: string;
  @Prop({ type: String, required: false })
  country: string;
  @Prop({ type: String, required: false })
  phoneOne: string;
  @Prop({ type: String, required: false })
  phoneTwo: string;
  @Prop({ type: Types.ObjectId, required: false })
  entityGuestId: Types.ObjectId;
  @Prop({ type: Boolean, required: false, default: false })
  receivePromotionalMessagesOrDiscounts: boolean;


}
export const CustomerSchema = SchemaFactory.createForClass(Customer);
