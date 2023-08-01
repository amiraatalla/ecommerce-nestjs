import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';
import { TypeEnum } from '../enums/type.enum';


export type TutorialDoc = Tutorial & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Tutorial extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true})
  owner: Types.ObjectId;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, default: TypeEnum.CUSTOMER, enum: Object.values(TypeEnum) })
  type: TypeEnum;
  @Prop({ type: String, required: true})
  url: string;

}
export const TutorialSchema = SchemaFactory.createForClass(Tutorial);
