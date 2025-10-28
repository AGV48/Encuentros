import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantesEncuentroService } from './participantes-encuentro.service';
import { ParticipantesEncuentroController } from './participantes-encuentro.controller';
import { ParticipanteEncuentro } from './entities/participante-encuentro.entity';
import { Encuentro } from '../encuentro/entities/encuentro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipanteEncuentro, Encuentro])],
  controllers: [ParticipantesEncuentroController],
  providers: [ParticipantesEncuentroService],
  exports: [ParticipantesEncuentroService],
})
export class ParticipantesEncuentroModule {}
