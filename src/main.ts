import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Conexa Movies API')
    .setDescription(
      'REST API for managing movies with Star Wars API (SWAPI) synchronization. Includes authentication, role-based authorization, and comprehensive CRUD operations.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints (register, login, refresh token)')
    .addTag('users', 'User management endpoints (CRUD operations)')
    .addTag('movies', 'Movie management and SWAPI sync endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
