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

  const originalLookup = dns.lookup.bind(dns);
  dns.lookup = ((hostname: string, optionsOrCallback: unknown, maybeCallback?: unknown) => {
    const hasOptions = typeof optionsOrCallback !== 'function';
    const options = (hasOptions ? optionsOrCallback : undefined) as
      | dns.LookupOneOptions
      | dns.LookupAllOptions
      | number
      | undefined;
    const callback = (hasOptions ? maybeCallback : optionsOrCallback) as
      | ((err: NodeJS.ErrnoException | null, address: string, family: number) => void)
      | ((
          err: NodeJS.ErrnoException | null,
          addresses: dns.LookupAddress[],
        ) => void)
      | undefined;

    if (!callback) {
      return originalLookup(hostname, options as dns.LookupOptions);
    }

    const wantsAll = typeof options === 'object' && options !== null && 'all' in options && !!options.all;

    return originalLookup(hostname, options as dns.LookupOptions, (err, address, family) => {
      if (!err) {
        if (wantsAll) {
          (callback as (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => void)(
            null,
            address as dns.LookupAddress[],
          );
        } else {
          (callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void)(
            null,
            address as string,
            family as number,
          );
        }
        return;
      }

      if (err.code !== 'ENOTFOUND') {
        if (wantsAll) {
          (callback as (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => void)(
            err,
            [] as dns.LookupAddress[],
          );
        } else {
          (callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void)(
            err,
            '' as string,
            0,
          );
        }
        return;
      }

      dns.resolve4(hostname, (resolveErr, addresses) => {
        if (resolveErr || !addresses || addresses.length === 0) {
          if (wantsAll) {
            (callback as (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => void)(
              err,
              [] as dns.LookupAddress[],
            );
          } else {
            (callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void)(
              err,
              '' as string,
              0,
            );
          }
          return;
        }

        if (wantsAll) {
          (callback as (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => void)(
            null,
            addresses.map((resolvedAddress) => ({ address: resolvedAddress, family: 4 })),
          );
        } else {
          (callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void)(
            null,
            addresses[0],
            4,
          );
        }
      });
    });
  }) as typeof dns.lookup;
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
