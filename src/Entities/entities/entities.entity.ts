import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { generateCode } from 'src/core/utils';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { Schedule } from '../classes/schedule.class';
import { EntityTypeEnum } from '../enum/entity-type.enum';


export type EntitiesDoc = Entities & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Entities extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true})
  owner: Types.ObjectId;
  @Prop({ type: String, required: true , unique: true })
  name: string;
  @Prop({ type: String, required: true,  enum: Object.values(EntityTypeEnum)  })
  entityType: EntityTypeEnum;
  @Prop({ type: String, required: true })
  address: string;
  @Prop({ type: String, required: true  })
  phoneNumber: string;
  @Prop({ type: String, required: false  })
  logo: string;
  @Prop({type: String,required: false})
  googleMapUrl: string;
  @Prop({type: String,required: false})
  facebookUrl: string;
  @Prop({type: String,required: false})
  instgramUrl: string;
  @Prop({type: String,required: false})
  twitterUrl: string;
  @Prop({type: String,required: false})
  youtubeUrl: string;
  
  @Prop({ type: String, required: true,unique: true, set: (value: string) => generateCode(value) })
  sku: string;
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Number, required: true, default: 0 })
  vat:number;
  @Prop({ type: Number, required: true, default: 0 })
  service:number;
  @Prop({ type: Number, required: true, default: 0 })
  dailyTarget:number;
  @Prop({ type: Number, required: true, default: 0 })
  weeklyTarget:number;
  @Prop({ type: Number, required: true, default: 0 })
  monthlyTarget:number;
  @Prop({ type: Number, required: true, default: 0 })
  yearlyTarget:number;
  @Prop({ type: Schedule, required: false })
  schedule: Schedule[];

  @Prop({ type: Types.ObjectId, required: false})
  guestId: Types.ObjectId;

  @Prop({type:Boolean, default: false ,required: false})
  posActive : boolean;
 
  
}
export const EntitiesSchema = SchemaFactory.createForClass(Entities);
