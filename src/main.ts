import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Official Club API Documentation')
    .setDescription(
      'Use this documentation to explore all endpoints, models, authentication methods, and integration guides.',
    )
    .setVersion('1.0')
    // .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: 'json',
    customSiteTitle: 'Club API Docs',
    swaggerOptions: {
      filter: true,
      persistAuthorization: true,
      showCommonExtensions: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT || 5000);
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
  console.log(
    `Swagger UI available at http://localhost:${process.env.PORT || 5000}/api/docs`,
  );
}
void bootstrap();
