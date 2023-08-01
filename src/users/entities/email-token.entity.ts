import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomBytes, randomInt } from 'crypto';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';
import { User } from './user.entity';
import { TokenType } from '../enums/token-type.enum';

export type EmailTokenDoc = EmailToken & Document;

/**
 * Model for the EmailToken entity in the system.
 */
@Schema({ timestamps: true, versionKey: false, id: false })
export class EmailToken extends BaseEntity {
  /** The user that this token code belongs to. */
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;
  /** Random alphanumeric code that is valid for only 5 m, sent to user in email. */
  // @Prop({ type: String, minlength: 6, maxlength: 6 })
  // code: string;
  @Prop({ type: String, default: () => Math.floor(100000 + Math.random() * 900000).toString(), minlength: 6, maxlength: 6  })
  code: string;


  @Prop({ type: String, enum: Object.values(TokenType), required:false })
  type: TokenType;

  @Prop({ type: Date})
  expirationDate: Date;
}

export const EmailTokenSchema = SchemaFactory.createForClass(EmailToken);
