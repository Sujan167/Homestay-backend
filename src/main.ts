import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
// import { logging } from './logging';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('My API') // Title of your API
    .setDescription('API documentation for My NestJS application') // Description of your API
    .setVersion('1.0') // API version
    .addBearerAuth() // If you're using Bearer Authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' is the path where Swagger UI will be available

  await app.listen(process.env.PORT ?? 8000);
  // logging.info(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
