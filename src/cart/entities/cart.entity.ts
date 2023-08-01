import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from 'src/core/entities';
import { Customer } from 'src/customer/entities/customer.entity';
import { Entities } from 'src/Entities/entities/entities.entity';
import { User } from 'src/users/entities/user.entity';
import { CartItems } from '../dto/create-item.dto';


export type CartDoc = Cart & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Cart extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Entities.name})
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, default: '635d16d0e238d2546541301b', ref: User.name })
  customerId: Types.ObjectId;
  @Prop({ type: CartItems, required: false })
  cartItems: CartItems[];
  @Prop({type:Number, required: false , default : 0})
  subTotal: number;
 
}
export const CartSchema = SchemaFactory.createForClass(Cart);
