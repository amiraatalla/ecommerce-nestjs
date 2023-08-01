import * as crypto from 'crypto';
import * as moment from 'moment';
import { Types } from 'mongoose';
import { TokenType } from 'src/users/enums/token-type.enum';

export const createToken = (
  userId: Types.ObjectId,
  type: TokenType,
  expirationMinutes = 5,
  size = 6,
): {
  token: string;
  expirationDate: number;
  userId: Types.ObjectId;
  type: TokenType;
} => {
  return {
    token : Math.floor(Math.floor(100000 + Math.random() * 900000)).toString().length ==6? Math.floor(100000 + Math.random() * 900000).toString():Math.floor(100000 + Math.random() * 900000).toString() ,
    expirationDate: moment().add(expirationMinutes,'minutes' ).valueOf(),
    userId: userId,
    type,
  };
};
