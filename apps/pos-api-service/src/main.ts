import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Sync API: http://localhost:${port}/api/sync/status`);
}
bootstrap();