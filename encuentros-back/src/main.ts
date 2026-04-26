import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dns from 'node:dns';

function configureDnsForNode() {
  const configuredServers = process.env.DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (configuredServers && configuredServers.length > 0) {
    dns.setServers(configuredServers);
    return;
  }

  const currentServers = dns.getServers();
  const isOnlyLocalResolver =
    currentServers.length > 0 &&
    currentServers.every((server) => server === '127.0.0.1' || server === '::1');

  // Prevent ENOTFOUND when local DNS resolver is misconfigured or unavailable.
  if (isOnlyLocalResolver) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  }
}

async function bootstrap() {
  configureDnsForNode();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // Permite solo tu frontend Angular
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
