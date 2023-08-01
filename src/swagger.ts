import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './config/config.service';

export function initSwagger(app: INestApplication): void {
  const config = app.get(ConfigService);
  const options = new DocumentBuilder()
    .setTitle('buyby API')
    .setDescription(
      '## 1. Getting started\n### 1.1 Download [Postman Collection](' + config.apiUrl + '-json) \n### 2.1 Download [Postman Collection](' + 'https://buy-by-1.herokuapp.com/api' + '-json)',
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
