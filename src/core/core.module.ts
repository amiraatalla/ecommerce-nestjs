import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { OgmaModule } from '@ogma/nestjs-module';
import { ConfigModule } from 'src/config/config.module';
import { HttpExceptionFilter } from './filters';
import { healthcheckModule } from './healthcheck/healthcheck.module';
import { LoggingInterceptor } from './interceptors';

@Module({
  imports: [
    healthcheckModule,
    OgmaModule.forFeature(HttpExceptionFilter),
    OgmaModule.forFeature(LoggingInterceptor),
    ConfigModule.Deferred,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class CoreModule {}
