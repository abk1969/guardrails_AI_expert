import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GitHubSyncModule } from './github-sync.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const PORT = process.env.SERVICE_PORT || 3000;

  const app = await NestFactory.create(GitHubSyncModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('GitHub Sync Service')
    .setDescription('Automated GitHub repository synchronization and deployment service')
    .setVersion('1.0')
    .addTag('GitHub Sync')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT);

  logger.log(`🚀 GitHub Sync Service running on http://localhost:${PORT}`);
  logger.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
}

bootstrap();
