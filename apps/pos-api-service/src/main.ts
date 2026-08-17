import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global Prefix ────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Global Exception Filter ──────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── Global Response Interceptor ──────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── CORS ─────────────────────────────────────────
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api`);
}

bootstrap();