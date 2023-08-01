/**
* Define and validate all env variables.
*/
import { IsEnum, IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { Environment } from '../enums/environment.enum';
import { OgmaLogLevel } from '../enums/omga-log-level.enum';
export class EnvironmentVariables {

  @IsEnum(Environment)
  NODE_ENV = Environment.Development;

  @IsString()
  APP_NAME: string;

  // @IsString()
  @IsString()
  LOG_LEVEL: OgmaLogLevel;
  /**
     * Sandbox mode, set to false to use live services (SendGrid, Slack, Sentry).
     */
  @IsIn([0, 1])
  SANDBOX_MODE: number;

  @IsNumber()
  PORT: number;

  @IsString()
  GLOBAL_PREFIX: string;

  @IsNumber()
  RATE_LIMIT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  API_URL: string;

  /**
   * Frontend URL.
   */
  @IsString()
  APP_URL: string;

  @IsString()
  API_KEY: string;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRY: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_EXPIRY: string;

  /**
   * Nodemailer email credential.
   */
  @IsString()
  GMAIL_FROM: string;

  /**
   * Nodemailer password credential.
   */
  @IsString()
  GMAIL_PASSWORD: string;

  /**
   * A non public email that receives.
   */
  @IsString()
  NONE_PUBLIC_EMAIL_ADDRESS: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  S3_BUCKET_NAME: string;

  @IsString()
  S3_REGION: string;

  @IsString()
  TWILIO_ACCOUNT_SID: string;

  @IsString()
  TWILIO_AUTH_TOKEN: string;

  @IsString()
  TWILIO_VERIFICATION_SERVICE_SID: string;

  @IsString()
  TWILIO_SENDER_PHONE_NUMBER: string;

  @IsString()
  FAWRY_MERCHANT_CODE: string;

  @IsString()
  FAWRY_SECURITY_KEY: string;

  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;
}
