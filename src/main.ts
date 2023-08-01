import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configure } from './config.main';
import { ConfigService } from './config/config.service';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
  bodyParser :true,
  logger: ['debug', 'verbose', 'error', 'warn'],
  // await app.listen(3000);
});
const config = app.get(ConfigService);
const port = config.port;
configure(app, config);


const adminConfig: ServiceAccount = {
  projectId: config.firebase.FIREBASE_PROJECT_ID,
  privateKey: config.firebase.FIREBASE_PRIVATE_KEY
    .replace(/\\n/g, '\n'),
  clientEmail: config.firebase.FIREBASE_CLIENT_EMAIL,
};
// Initialize the firebase admin app
admin.initializeApp({
  credential: admin.credential.cert(adminConfig),
  // databaseURL: config.firebase.FIREBASE_DATABASE_URL,
});


await app.listen(port);
Logger.verbose(`${config.nodeEnv} | http://localhost:${port}/api`, 'NestApplication');

}
bootstrap();
