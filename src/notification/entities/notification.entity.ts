import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';
import { NotificationData } from '../classes/notification-data.class';

export type NotificationDoc = Notification & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Notification extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: 'User' })
  userId: Types.ObjectId;
  @Prop({ type: String, required: false})
  userName:string;
  @Prop({ type: NotificationData, required: true })
  notificationData: NotificationData;
  @Prop({ type: Boolean, required: false, default: false })
  isRead: boolean;
  @Prop({ type: Boolean, required: false, default: false })
  allCustomers: boolean;
  @Prop({ type: Boolean, required: false, default: false })
  allBusinessOwners: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
