import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from 'src/core/entities';

export type CouponDoc = Coupon & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Coupon extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true})
  owner: Types.ObjectId;
  @Prop({ type: String, required: true, unique: true })
  code: string;
  @Prop({ type: Number, required: true })
  value: number;
  @Prop({ type: Number, required: false })
  limit: number;
  @Prop({ type: Boolean, default: true,required: false })
  status: boolean;
  @Prop({ type: Boolean, default: false,required: false })
  used: boolean;
  @Prop({ type: [Types.ObjectId], required: false })
  userIds : Types.ObjectId[];
  @Prop({ type: Date, required: true })
  expireOn: Date;
 
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
