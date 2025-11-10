import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeDatabase } from './database/seeder.service';

async function bootstrap() {
  await initializeDatabase();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost', 'http://localhost:4200', 'http://localhost:80'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Encuentros API')
    .setDescription('Documentación de la API del proyecto Encuentros')
    .setVersion('1.0')
    //.addBearerAuth() // <-- Descomenta si usas JWT o tokens
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
