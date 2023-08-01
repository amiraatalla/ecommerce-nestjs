import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { Subscription } from 'src/subscribtion/entities/subscribtion.entity';

import { PricingEnum } from 'src/subscribtion/enum/pricing.enum';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { toHash } from '../../core/utils';
import { ProfileStatusEnum } from '../enums/profile-status.enum';
import { RolesEnum } from '../enums/roles.enum';
import { StatusEnum } from '../enums/status.enum';
import { SubscriptionTypeEnum } from '../enums/subscription-type.enum';

export type UserDoc = User & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class User extends BaseEntity {
  @Prop({ type: String, required: true, index: true, unique: true })
  email: string;
  @Prop({ type: String, required: false, set: (value: string) => toHash(value) })
  password: string;

  @Prop({ type: String,default:'', required: false, set: (value: string) => toHash(value) })
  pin: string;

  @Prop({ type: String, required: false })
  name: string;
  @Prop({ type: String, required: false })
  address: string;
  @Prop({ type: String, required: true , unique: true })
  phoneNumber: string;
  @Prop({ type: String, required: false  })
  profilePicture: string;
  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;
  @Prop({type: String})
  token: string
  @Prop({ type: String, enum: Object.values(RolesEnum) })
  role: RolesEnum;
  @Prop({ type: String , required: false})
  type: string;
  @Prop({ type: Boolean, default: true })
  active: boolean; 
  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  devicesToken: string[];
  
  //store or RESTURANT
  @Prop({ type: String, default: SubscriptionTypeEnum.CASHIER,enum: Object.values(SubscriptionTypeEnum) })
  subscriptionType: SubscriptionTypeEnum;
    
  @Prop({ type: String, default: PricingEnum.QUARTERLY, enum: Object.values(PricingEnum) })
  pricing: PricingEnum;

  @Prop({ type: String})
  registrationNumber: string;
  @Prop({ type: String })
  taxID: string;
  
  
  @Prop({ type: String, default: StatusEnum.INITIAL, enum: Object.values(StatusEnum) })
  status: StatusEnum;

 
  @Prop({ type: Types.ObjectId, required: false})
  owner: Types.ObjectId;

  @Prop({ type: String, default: ProfileStatusEnum.COMPLETED, enum: Object.values(ProfileStatusEnum) })
  profileStatus: ProfileStatusEnum;

  @Prop({ type: Types.ObjectId, required: false , ref: Entities.name})
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: Subscription.name })
  packageId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: false})
  guestId: Types.ObjectId;

  @Prop({ type: Date, required: false })
  expireOn: Date;

  @Prop({ type:Number, required: false , default: 0 })
  extraLimit:number;
  @Prop({ type:Number, required: false , default: 0 })
  price:number;

  @Prop({ type: Boolean, required: false, default: false })
  receivePromotionalMessagesOrDiscounts: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
