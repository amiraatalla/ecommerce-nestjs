import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PIN_POLICY } from '../constants';

@ValidatorConstraint({ name: 'strongPin', async: false })
export class StrongPin implements ValidatorConstraintInterface {
  validate(pin: string): boolean {
    return typeof pin === 'string' && !!pin.match(PIN_POLICY);
  }

  defaultMessage(): string {
    return 'Pin must be at least 8 characters and include one lowercase letter, one uppercase letter, one special character, and one digit.';
  }
}

export function IsStrongPin(
  validationOptions?: ValidationOptions,
): (object: any, propertyName: string) => void {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: StrongPin,
    });
  };
}
