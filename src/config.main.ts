import { ValidationPipe } from '@nestjs/common';
// import * as helmet from 'helmet';
import  helmet from 'helmet';
import * as compression from 'compression';
// import * as rateLimiter from 'express-rate-limit';
import rateLimiter from 'express-rate-limit';

import * as cookieParser from 'cookie-parser';
import cookieSession = require('cookie-session');

import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from './config/config.service';
import { initSwagger } from './swagger';
import { NextFunction, Request, Response } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Configure Express application and middleware.
 */
export function configure(app: NestExpressApplication, config: ConfigService): void {
  app.set('trust proxy', 1); // trust first proxy
  app.use(
    // Set security-related HTTP headers
    helmet(),
    // Compress response bodies for most requests
    compression(),
    // Parse Cookie header and populate req.cookies with an object keyed by the cookie names
    cookieParser(),
    // Simple cookie-based session middleware
    cookieSession({ name: 'session', signed: true, keys: ['key'] }),
    // MERCHANT_BASIC rate-limiting middleware for Express
    rateLimiter({
      windowMs: 10 * 60 * 1000, // 1 Hour
      max: config.rateLimit,
      message: 'Too many requests, please try again later.',
    }),
    // https://github.com/MERCHANT_SILVERbergyoni/nodebestpractices/blob/49da9e5e41bd4617856a6ecd847da5b9c299852e/sections/production/assigntransactionid.md
    (req: Request, res: Response, next: NextFunction) => {
        req.session.id= req?.session?.id ?? uuidv4();
      next();
    },
  );
  // Registers pipes as global pipes (will be used within every HTTP route handler)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Enables CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    credentials: true,
    origin: '*',
  });
  // Registers a prefix for every HTTP route path.
  app.setGlobalPrefix(config.globalPrefix);
  // Initialize swagger documentation
  initSwagger(app);
}
