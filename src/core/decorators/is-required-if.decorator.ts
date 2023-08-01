import {
  isDefined,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Define new constraint that checks the value of sibling properties
@ValidatorConstraint({ async: false })
export class IsDependantOnConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    console.log(args);
    if (!isDefined(value) && args.constraints.length) {
      return this.getFailedConstraints(args).length === 0;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    let message = `${args.property} must exist if the following properties exists:`;
    for (const error of this.getFailedConstraints(args)) {
      const key = Object.keys(error)[0];
      message += ` ${key} with value ${error[key].join(', ')}`;
    }

    return message;
  }

  getFailedConstraints(args: ValidationArguments): string[] {
    return args.constraints.filter((prop: Record<string, any>) => {
      const key = Object.keys(prop)[0];
      return prop[key].includes(args.object[key]);
    });
  }
}

export function IsRequiredIf(
  props: Record<string, any>[],
  validationOptions?: ValidationOptions,
): (object: any, propertyName: string) => void {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: props,
      options: validationOptions,
      validator: IsDependantOnConstraint,
    });
  };
}
