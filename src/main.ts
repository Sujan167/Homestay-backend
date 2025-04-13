import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  if (configService.get('ENVIRONMENT') === 'development') {
    app.enableCors();

    const config = new DocumentBuilder()
      .setTitle('HomeStay App API docs')
      .setDescription('API docs')
      .setVersion('1.0')
      //.addServer(`http://localhost:${port}/private`, 'Private Calls')
      .addServer(`http://localhost:${port}/api/v1`)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'jwt',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: true,
    });

    // Save the Swagger JSON to a file
    // fs.writeFileSync('swagger-spec.json', JSON.stringify(document, null, 2));

    SwaggerModule.setup('docs', app, document);
    console.log(
      'Swagger setup complete. Access it at http://localhost:' + port + '/docs',
    );
  }
  // Set the global API prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
