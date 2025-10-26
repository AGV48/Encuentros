import { Module } from '@nestjs/common';
import { EncuentroService } from './encuentro.service';
import { EncuentroController } from './encuentro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encuentro } from './entities/encuentro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Encuentro])],
  controllers: [EncuentroController],
  providers: [EncuentroService],
  exports: [TypeOrmModule],
})
export class EncuentroModule {}
