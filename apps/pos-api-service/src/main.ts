import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for WebSocket
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Ryzera POS API')
    .setDescription('POS system API with offline-first sync')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  
  console.log(`\n🚀 API: http://localhost:3000/api`);
  console.log(`🔌 WebSocket: ws://localhost:3000`);
  console.log(`📚 Swagger: http://localhost:3000/api/docs\n`);
}
bootstrap();