import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '../../core/entities';
import { SupplierDetails } from '../dto/create-supplier.dto';
import { DeliveryTermsEnum } from '../enum/delivery-terms-enum';
import { PaymentTypeEnum } from '../enum/payment.enum';

export type SupplierDoc = Supplier & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Supplier extends BaseEntity {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  address: string;
  @Prop({ type: String, required: true })
  city: string;
  @Prop({ type: String, required: true })
  country: string;
  @Prop({ type: [String], required: true })
  canDeliverTo: string[];

  @Prop({ type: String, required: true })
  TaxID: string;
  @Prop({ type: SupplierDetails, required: false })
  contactPersonDetails: SupplierDetails;
  @Prop({ type: Boolean, default: true })
  acceptsOrderByEmail: boolean;
  @Prop({ type: String, required: false })
  notes: string;
 
  @Prop({ type: String, default: PaymentTypeEnum.POST_PAID , required: true, enum: Object.values(PaymentTypeEnum) })
  paymentTerms: PaymentTypeEnum;
  // @Prop({ type: String, default: DeliveryTermsEnum.cfr , required: true, enum: Object.values(DeliveryTermsEnum) })
  // deliveryTerms: DeliveryTermsEnum;

}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
