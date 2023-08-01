import { UnauthorizedException } from '@nestjs/common';

const message = '004,R004';
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super(message);
  }
}
