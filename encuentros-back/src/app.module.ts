import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { EncuentroModule } from './encuentro/encuentro.module';
import { ChatModule } from './chat/chat.module';
import { ParticipantesEncuentroModule } from './participantes-encuentro/participantes-encuentro.module';
import { PresupuestoModule } from './presupuesto/presupuesto.module';
import { BolsilloModule } from './bolsillo/bolsillo.module';
import { AporteModule } from './aporte/aporte.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'oracle',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1521', 10),
      username: process.env.DB_USERNAME || 'ENCUENTROS_ADMIN',
      password: process.env.DB_PASSWORD || 'admin',
      serviceName: process.env.DB_SERVICE_NAME || 'XEPDB1',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrationsRun: true,
    }),
    AuthModule,
    UsersModule,
    EncuentroModule,
    ChatModule,
    ParticipantesEncuentroModule,
    PresupuestoModule,
    BolsilloModule,
    AporteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
