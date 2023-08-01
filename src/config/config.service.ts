import { Inject, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CONFIG_MODULE_OPTIONS } from './config.constants';
import { ConfigModuleOptions } from './interfaces/config-options.interface';
import { EnvironmentVariables } from './model/env.model';

@Injectable()
export class ConfigService {
  /** Variable to hold the env variables. */
  private envConfig: EnvironmentVariables;

  constructor(@Inject(CONFIG_MODULE_OPTIONS) options: ConfigModuleOptions) {
    // Check that a config file is provided or using process.env is set to true
    if (!options.useProcess && !options.filename) {
      throw new Error(
        'Missing configuration options.' +
          ' If using process.env variables, please mark useProcess as "true".' +
          ' Otherwise, please provide an env file.',
      );
    }

    let config: { [key: string]: any };
    if (!options.useProcess && options.filename) {
      try {
        
        if (!process.env.PWD) {
          process.env.PWD = process.cwd();
        }
        // Read config from a file
        config = parse(readFileSync(join(process.env.PWD, options.filename)));
      } catch (error) {
        config = process.env;
      }
    } else {
      // Read config from process.env
      config = process.env;
    }


    this.envConfig = this.validateConfig(config);
  }

  /**
   * Validates and transforms configs.
   * @param {Record<string, any>} config
   * @returns {EnvironmentVariables}
   */
  private validateConfig(config: Record<string, any>): EnvironmentVariables {
    // Convert plain config to class
    const validatedConfig = plainToClass(EnvironmentVariables, config, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });
    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validatedConfig;
  }

  get appName(): string {
    return this.envConfig.APP_NAME;
  }

  get logLevel(): any {
    return this.envConfig.LOG_LEVEL;
  }

  get sandbox(): boolean {
    return this.envConfig.SANDBOX_MODE === 1;
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get isProd(): boolean {
    const env = this.nodeEnv.toLowerCase();
    return env === 'production';
  }

  /**
   * CORS (Cross-Origin Resource Sharing) config.
   */
  get cors() {
    const origin = {
      development: '*',
      staging: '*',
      test: [/localhost/],
      production: '*',
    };

    return origin[this.nodeEnv];
  }

  get globalPrefix(): string {
    return this.envConfig.GLOBAL_PREFIX;
  }

  get port(): number {
    return this.envConfig.PORT;
  }

  get rateLimit(): number {
    return this.envConfig.RATE_LIMIT;
  }

  get databaseUrl(): string {
    return this.envConfig.DATABASE_URL;
  }

  get apiUrl(): string {
    return this.envConfig.API_URL;
  }

  get appUrl(): string {
    return this.envConfig.APP_URL;
  }

  get apiKey(): string {
    return this.envConfig.API_KEY;
  }
  
 
  get jwtAccessTokenSecret(): string {
    return this.envConfig.JWT_ACCESS_TOKEN_SECRET;
  }

  get jwtAccessTokenExpiry(): string {
    return this.envConfig.JWT_ACCESS_TOKEN_EXPIRY;
  }

  get jwtRefreshTokenSecret(): string {
    return this.envConfig.JWT_REFRESH_TOKEN_SECRET;
  }

  get jwtRefreshTokenExpiry(): string {
    return this.envConfig.JWT_REFRESH_TOKEN_EXPIRY;
  }

  get gmailFrom(): string {
    return this.envConfig.GMAIL_FROM;
  }

  get gmailPassword(): string {
    return this.envConfig.GMAIL_PASSWORD;
  }

  get nonPublicEmailAddress(): string {
    return this.envConfig.NONE_PUBLIC_EMAIL_ADDRESS;
  }


  // get twilio() {
  //   return {
  //     accountSId: this.envConfig.TWILIO_ACCOUNT_SID,
  //     authToken: this.envConfig.TWILIO_AUTH_TOKEN,
  //     serviceSid: this.envConfig.TWILIO_VERIFICATION_SERVICE_SID,
  //     senderPhoneNumber: this.envConfig.TWILIO_SENDER_PHONE_NUMBER,
  //   };
  // }

  get aws() {
    return {
      accessKeyId: this.envConfig.AWS_ACCESS_KEY_ID,
      secretAccessKey: this.envConfig.AWS_SECRET_ACCESS_KEY,
      region: this.envConfig.S3_REGION,
      bucket: this.envConfig.S3_BUCKET_NAME,
    };
  }

  get fawry(){
    return{
      FAWRY_MERCHANT_CODE : this.envConfig.FAWRY_MERCHANT_CODE,
      FAWRY_SECURITY_KEY : this.envConfig.FAWRY_SECURITY_KEY,
    }
  }

  get firebase(){
    return{
      FIREBASE_PROJECT_ID : this.envConfig.FIREBASE_PROJECT_ID,
      FIREBASE_PRIVATE_KEY : this.envConfig.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL : this.envConfig.FIREBASE_CLIENT_EMAIL,
    }
  }


}

