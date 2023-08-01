import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { ActionsEnum } from '../enums/actions.enums';

export type SYSLogDoc = SYSLog & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class SYSLog extends BaseEntity {
  
  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Types.ObjectId, ref: User.name , required: false })
  userId: Types.ObjectId;
 
  @Prop({ type: String, required: true, enum: Object.values(ActionsEnum) })
  action: ActionsEnum;
  
  @Prop({ type: String, required : false })
  userEmail: String;
  @Prop({ type: String, required : false })
  userPhoneNumber: String; 
  
}

export const SYSLogSchema = SchemaFactory.createForClass(SYSLog);
