import { HttpStatus } from '@nestjs/common';

/**
 * Represents shape of the error response sent by the api.
 */
export interface ErrorObject {
  statusCode: HttpStatus;
  method: string;
  url: string;
  // body: any;
  timestamp: string;
  stack?: any;
  error?: any;
  message?: string;
}
