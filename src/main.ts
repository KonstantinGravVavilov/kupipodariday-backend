import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const appConfig = config().app;
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(appConfig.port);
}

bootstrap();
