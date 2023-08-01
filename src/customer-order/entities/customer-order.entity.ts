import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';
import { OrderTypeEnum } from '../enums/order-type.enum';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { Customer } from 'src/customer/entities/customer.entity';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { ReturnMethodEnum } from '../enums/return-method.enum';
import { ORDER_STATUS } from '../constants/order.constant';
import { StateStore } from '@buyby/state-machine';
import { StatusEnum } from '../enums/status.enum ';
import { CustomerItem } from '../dto/create-customer-item.dto';
import { CustomerOrderServices } from '../dto/customer-order-service.dto';
import { User } from 'src/users/entities/user.entity';
import { Entities } from 'src/Entities/entities/entities.entity';
import { Warehouse } from 'src/warehouse-management/entities/warehouse.entity';


export type CustomerOrderDoc = CustomerOrder & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class CustomerOrder extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: false, ref: Entities.name })
  entityId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: Warehouse.name })
  warehouseId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false , ref: User.name })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, default: '6390af41d41122d9d65eb640', ref: User.name })
  customerId: Types.ObjectId;
  @Prop({ type: String, default: OrderTypeEnum.PHYSICAL, enum: Object.values(OrderTypeEnum), required: true })
  orderType: OrderTypeEnum;
  @Prop({ type: String, default: OrderStatusEnum.ACTIVE, enum: Object.values(OrderStatusEnum), required: true })
  @StateStore(ORDER_STATUS)
  orderStatus: OrderStatusEnum;
  @Prop({ type: String, enum: Object.values(ReturnMethodEnum), required: false })
  returnMethod: ReturnMethodEnum;
  @Prop({ type: String, enum: Object.values(StatusEnum), required: false })
  status: StatusEnum;
  @Prop({ type: CustomerItem, required: false })
  items: CustomerItem[];
  @Prop({ type: CustomerOrderServices, required: false })
  services: CustomerOrderServices[];
  @Prop({ type: CustomerItem, required: false })
  voidedItems: CustomerItem[];
  @Prop({ type: CustomerItem, required: false })
  returnedItems: CustomerItem[];
  @Prop({ type: CustomerItem, required: false })
  refundedItems: CustomerItem[];
  @Prop({ type: CustomerOrderServices, required: false })
  voidedServices: CustomerOrderServices[];
  @Prop({ type: CustomerOrderServices, required: false })
  returnedServices: CustomerOrderServices[];
  @Prop({ type: CustomerOrderServices, required: false })
  refundedServices: CustomerOrderServices[];
  @Prop({ type: String, default: PaymentMethodEnum.CASH, enum: Object.values(PaymentMethodEnum), required: true })
  paymentMethod: PaymentMethodEnum;
  @Prop({ type: Number, required: true, default: 0 })
  totalOrder: number;
  @Prop({ type: Number, required: true, default: 0 })
  orderOldPrice: number;

  @Prop({ type: Number, required: true, default: 0 })
  discountValue: number;
  @Prop({ type: Number, required: true, default: 0 })
  vat: number;
  @Prop({ type: Number, required: true, default: 0 })
  service: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalOrderWithDiscount: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalPriceWithVatAndService: number;
  @Prop({ type: Types.ObjectId, required: false })
  releaseTransactionId: Types.ObjectId;

  @Prop({ type: String, required: false })
  methodName: string;

  @Prop({ type: String, required: false })
  couponCode: string;
  


  @Prop({ type: Types.ObjectId, required: false })
  discountId: Types.ObjectId;
  
  @Prop({ type: String, default: Date.now(),required: false })
  reset_field: String
  
  @Prop({ type: Number, required: false })
  ID: number;
}
export const CustomerOrderSchema = SchemaFactory.createForClass(CustomerOrder);
