import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@OgmaLogger(LoggingInterceptor) private readonly logger: OgmaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl;

    // NOTE Exclude stripe webhook endpoint
    if (!url || url === '/api/stripe/webhook') {
      return next.handle();
    }

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        const responseTime = Date.now() - now;
        this.logger.info({
          method,
          url,
          statusCode,
          responseTime,
          requestId: request.session.id,
        });
      }),
    );
  }
}
