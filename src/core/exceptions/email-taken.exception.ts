import { BadRequestException } from '@nestjs/common';

const message = '009,R009';
export class EmailTakenException extends BadRequestException {
  constructor() {
    super(message);
  }
}
