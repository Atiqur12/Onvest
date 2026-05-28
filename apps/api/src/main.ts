import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClerkService } from './auth/clerk.service';
import { S3Service } from './storage/s3.service';
import { AiService } from './ai/ai.service';
import { NotificationsService } from './notifications/notifications.service';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: process.env.WEB_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.get(ClerkService).warnIfMissing();
  app.get(S3Service).warnIfMissing();
  app.get(AiService).warnIfMissing();
  app.get(NotificationsService).warnIfMissing();

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  logger.log(`Onvest API listening on http://localhost:${port}`);
}

void bootstrap();
