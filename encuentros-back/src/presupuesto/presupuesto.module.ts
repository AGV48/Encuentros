import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresupuestoService } from './presupuesto.service';
import { PresupuestoController } from './presupuesto.controller';
import { Presupuesto } from './entities/presupuesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Presupuesto])],
  controllers: [PresupuestoController],
  providers: [PresupuestoService],
  exports: [PresupuestoService],
})
export class PresupuestoModule {}
