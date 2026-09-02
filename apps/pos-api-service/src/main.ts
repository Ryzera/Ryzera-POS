import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-user-type',
            'x-branch-id',
            'x-company-id',
        ],
    });

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Ryzera POS — Auth & User Management API')
        .setDescription(`
## Authentication & Authorization Module

### Features:
- JWT Authentication
- Role-Based Access Control (RBAC)
- Account Lock (5 failed attempts)
- Audit Logging
- Multi-tenant (Company + Branch)

### Roles:
- **ADMIN** — Full access
- **MANAGER** — Branch management
- **CASHIER** — POS access
- **INVENTORY_MANAGER** — Stock management
    `)
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token from /auth/login',
                in: 'header',
            },
            'JWT-auth',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(` API: http://localhost:${port}/api`);
    console.log(` Docs: http://localhost:${port}/api/docs`);
}

bootstrap();