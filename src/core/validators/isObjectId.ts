import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';
import { ObjectId } from '../utils';

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: `${propertyName} must be a mongodb id`,
      },
      validator: {
        validate(value: string | ObjectId) {
          return Types.ObjectId.isValid(value);
        },
      },
    });
  };
}
