import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config({ path: '.env.development' });
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT_NEST);
}

bootstrap();
