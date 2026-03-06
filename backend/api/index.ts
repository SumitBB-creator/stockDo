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
    try {
        if (!cachedApp) {
            console.log('Initializing NestJS application for Vercel...');
            // Enforce IST Timezone
            process.env.TZ = 'Asia/Kolkata';

            const app = await NestFactory.create<NestExpressApplication>(AppModule);

            // global prefix
            app.setGlobalPrefix('api/v1');

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
            console.log('NestJS application initialized successfully.');
        }

        const instance = cachedApp.getHttpAdapter().getInstance();
        return instance(req, res);
    } catch (error) {
        console.error('CRITICAL: Failed to initialize or handle request:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error during initialization',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
}
