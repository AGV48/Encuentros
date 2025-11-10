import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    level: 'info',
    msg: `Application is running on port ${port}`,
    context: 'Bootstrap'
  }));
}
bootstrap();
