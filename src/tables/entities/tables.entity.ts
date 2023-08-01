import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Customer } from 'src/customer/entities/customer.entity';
import { Entities } from 'src/Entities/entities/entities.entity';
import { BaseEntity } from '../../core/entities';


export type TableDoc = Table & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Table extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true, ref:Entities.name})
  entityId: Types.ObjectId;
  @Prop({type: String,required: true})  
  code: string;
  @Prop({ type: String, required: false })
  name: string;
  @Prop({ type: String, required: false })
  area: string;
  @Prop({ type: Number, required: true })
  seats: number;
  @Prop({ type: Boolean, default: false })
  status: boolean;
}
export const TableSchema = SchemaFactory.createForClass(Table);
