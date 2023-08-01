import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { BaseEntity } from '../../core/entities';

export type StockCategoryDoc = StockCategory & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class StockCategory extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false })
  parentStockategoryId: Types.ObjectId;
  @Prop({ type: String, required: true })
  stockategoryName: string;
  @Prop({ type: Boolean, required: false })
  department: boolean;
  @Prop({ type: Boolean,default:false, required: false })
  section: boolean;
}

export const StockCategorySchema = SchemaFactory.createForClass(StockCategory);
