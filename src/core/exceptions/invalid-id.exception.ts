import { BadRequestException } from '@nestjs/common';

const message = '005,R005';
export class InvalidIdException extends BadRequestException {
  constructor() {
    super(message);
  }
}
