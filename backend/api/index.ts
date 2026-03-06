import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { join } from 'path';
import * as fs from 'fs';

let cachedApp: NestExpressApplication;

export default async function handler(req: any, res: any) {
    if (!cachedApp) {
        // Enforce IST Timezone
        process.env.TZ = 'Asia/Kolkata';

        const app = await NestFactory.create<NestExpressApplication>(AppModule);

        // global prefix
        app.setGlobalPrefix('api/v1');

        // ensure uploads directory exists (note: Vercel filesystem is read-only except /tmp)
        const uploadDir = join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir);
            } catch (e) {
                console.warn('Could not create uploads dir (likely Vercel environment):', e);
            }
        }

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

        await app.init();
        cachedApp = app;
    }

    const instance = cachedApp.getHttpAdapter().getInstance();
    return instance(req, res);
}
