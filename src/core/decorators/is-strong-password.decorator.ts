import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PASSWORD_POLICY } from '../constants';

@ValidatorConstraint({ name: 'strongPassword', async: false })
export class StrongPassword implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    return typeof password === 'string' && !!password.match(PASSWORD_POLICY);
  }

  defaultMessage(): string {
    return 'Password must be at least 8 characters and include one lowercase letter, one uppercase letter, one special character, and one digit.';
  }
}

export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): (object: any, propertyName: string) => void {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: StrongPassword,
    });
  };
}
