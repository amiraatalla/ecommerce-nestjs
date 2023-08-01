import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubscriptionTypeEnum } from 'src/users/enums/subscription-type.enum';
import { BaseEntity } from '../../core/entities';
import { PricingEnum } from '../enum/pricing.enum';

export type SubscriptionDoc = Subscription & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Subscription extends BaseEntity {
  
  @Prop({ type: [Types.ObjectId], required: true})
  ownerId: Types.ObjectId[];
  @Prop({ type: [Types.ObjectId], required: false, default:[]})
  users: Types.ObjectId[];
  // @Prop({ type: [Types.ObjectId], required: false, default:[]})
  // extraUsers: Types.ObjectId[];
 
  @Prop({ type:Number, required: false })
  extraLimit:number;
  @Prop({ type:Object , required: false })
  limits:object;
  @Prop({ type: Date, required: false })
  expireOn: Date;

  @Prop({ type:Number, required: false , default: 0 })
  price:number;
  
  @Prop({ type: Boolean, default: true })
  active: boolean; 

  @Prop({ type: String , required: false  })
  subscriptionType: SubscriptionTypeEnum;
    
  @Prop({ type: String , required: false  })
  pricing: PricingEnum;

}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
