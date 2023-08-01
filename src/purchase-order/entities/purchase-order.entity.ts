import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Entities } from 'src/Entities/entities/entities.entity';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';
import { BaseEntity } from '../../core/entities';
import { PurchaseOrderClass } from '../classes/purchase-order.class';

export type PurchaseOrderDoc = PurchaseOrder & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class PurchaseOrder extends BaseEntity {
  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: Supplier.name })
  supplierId: Types.ObjectId;
  @Prop({ type: PurchaseOrderClass })
  items: PurchaseOrderClass[];
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
