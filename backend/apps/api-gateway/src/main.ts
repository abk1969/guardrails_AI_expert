import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      configService.get('CORS_ORIGIN', 'http://localhost:3004'),
      'http://localhost:5080', // Standalone mode
      'http://localhost:3000', // Alternative dev port
    ],
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api'));

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Risk Manager API')
    .setDescription('API for AI Risk Management and Guardrail Testing')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tests', 'Test execution endpoints')
    .addTag('policies', 'AI policy management')
    .addTag('risks', 'Risk assessment endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`
    🚀 Application started successfully!

    📡 API Gateway running on: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api/docs
    🌍 Environment: ${configService.get('NODE_ENV')}

    Ready to accept connections...
  `);
}

bootstrap();
