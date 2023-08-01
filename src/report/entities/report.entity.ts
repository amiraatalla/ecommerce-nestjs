import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';


export type ReportDoc = Report & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Report extends BaseEntity {
}
export const ReportSchema = SchemaFactory.createForClass(Report);
