import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Customer } from 'src/customer/entities/customer.entity';
import { BaseEntity } from '../../core/entities';


export type NoteDoc = Note & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Note extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true})
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true})
  customer: Types.ObjectId;
  @Prop({type: String,required: true})  //required false
  notes: string;
}
export const NoteSchema = SchemaFactory.createForClass(Note);
