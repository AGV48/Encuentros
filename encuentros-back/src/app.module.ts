import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { EncuentroModule } from './encuentro/encuentro.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'oracle',
      host: 'localhost',
      port: 1521,
      // En el caso de la mayoría deben poner:
      // username: 'C##ENCUENTROS_ADMIN',
      username: 'C##ENCUENTROS_ADMIN', // Yo: Tomas
      password: 'admin',
      // Pueden verlo en SqlDeveloper, en propiedades de cada conexión, en este caso en
      // XE_ENCUENTROS, allí ven si se conectan por SID o ServiceName y si es: XE o XEPDB1
      // En el caso de la mayoría deben poner:
      // sid: 'XE',
      serviceName: 'XE', // Yo: Tomas
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrationsRun: true,
    }),
    UsersModule,
    EncuentroModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
