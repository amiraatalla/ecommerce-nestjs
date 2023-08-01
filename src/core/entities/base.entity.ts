import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class BaseEntity {
  constructor(args: any = {}) {
    Object.assign(this, args);
  }

  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: any;
  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date })
  updatedAt: Date;
}
