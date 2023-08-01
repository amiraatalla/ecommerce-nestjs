import { CallHandler } from '@nestjs/common';
import { OgmaService } from '@ogma/nestjs-module';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  headers: jest.fn().mockResolvedValue({ 'x-request-id': 'uuid' }),
};

const callHandler: CallHandler<any> = {
  handle: () => of({}),
};

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  beforeEach(() => {
    interceptor = new LoggingInterceptor(new OgmaService());
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('should return the data wrapped in data object', () => {
    // we use done here to be able to tell the observable subscribe function
    // when the observable should finish. If we do not pass done
    // Jest will complain about an asynchronous task not finishing within 5000 ms.
    it('should successfully return', (done) => {
      // if your interceptor has logic that depends on the context
      // you can always pass in a mock value instead of an empty object
      // just make sure to mock the expected alls like switchToHttp
      // and getRequest
      interceptor.intercept(executionContext as any, callHandler).subscribe({
        next: (value) => {
          expect(value).toBeTruthy();
        },
        error: (error) => {
          throw error;
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
