import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { Characteristic } from '../dto/characteristic.dto';
import { Receiver } from '../dto/receiver.dto';
import { MessageTypeEnum } from '../enums/message-type.enum';


export type EtisalatSMSDoc = EtisalatSMS & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class EtisalatSMS extends BaseEntity {

  @Prop({ type: String, required: true })
  id: string;
  
  @Prop({ type: String,enum: Object.values(MessageTypeEnum), default: MessageTypeEnum.SMS, required: false})
  messageType: MessageTypeEnum;

  @Prop({ type: Characteristic, required: true})
  characteristic: Characteristic[];
 
  @Prop({ type: Receiver, required: true})
  receiver: Receiver[];
 
}
export const EtisalatSMSSchema = SchemaFactory.createForClass(EtisalatSMS);
