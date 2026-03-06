import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // Enforce IST Timezone
  process.env.TZ = 'Asia/Kolkata';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // global prefix
  app.setGlobalPrefix('api/v1');

  // ensure uploads directory exists
  const uploadDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // serve static assets
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
    setHeaders: (res, path, stat) => {
      res.set('Access-Control-Allow-Origin', '*');
    },
  });

  // global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // global filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // global interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // enable cors
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
