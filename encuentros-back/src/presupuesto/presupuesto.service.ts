import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { Presupuesto } from './entities/presupuesto.entity';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
  ) {}

  async create(
    createPresupuestoDto: CreatePresupuestoDto,
  ): Promise<Presupuesto> {
    const presupuesto = this.presupuestoRepository.create(createPresupuestoDto);
    return await this.presupuestoRepository.save(presupuesto);
  }

  async findAll(): Promise<Presupuesto[]> {
    return await this.presupuestoRepository.find({
      relations: ['encuentro'],
    });
  }

  async findOne(id: number): Promise<Presupuesto> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id },
      relations: ['encuentro'],
    });

    if (!presupuesto) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }

    return presupuesto;
  }

  async findByEncuentro(idEncuentro: number): Promise<Presupuesto | null> {
    return await this.presupuestoRepository.findOne({
      where: { idEncuentro },
      relations: ['encuentro'],
    });
  }

  async update(
    id: number,
    updatePresupuestoDto: UpdatePresupuestoDto,
  ): Promise<Presupuesto> {
    const presupuesto = await this.findOne(id);
    Object.assign(presupuesto, updatePresupuestoDto);
    return await this.presupuestoRepository.save(presupuesto);
  }

  async remove(id: number): Promise<void> {
    const presupuesto = await this.findOne(id);
    await this.presupuestoRepository.remove(presupuesto);
  }
}
