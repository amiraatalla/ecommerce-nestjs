import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { BaseEntity } from '../../core/entities';

export type ServicesDoc = Services & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Services extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: Number, required: true })
  price: number;
  
}

export const ServicesSchema = SchemaFactory.createForClass(Services);
