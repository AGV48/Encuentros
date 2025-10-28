import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBolsilloDto } from './dto/create-bolsillo.dto';
import { UpdateBolsilloDto } from './dto/update-bolsillo.dto';
import { Bolsillo } from './entities/bolsillo.entity';

@Injectable()
export class BolsilloService {
  constructor(
    @InjectRepository(Bolsillo)
    private readonly bolsilloRepository: Repository<Bolsillo>,
  ) {}

  async create(createBolsilloDto: CreateBolsilloDto): Promise<Bolsillo> {
    const bolsillo = this.bolsilloRepository.create(createBolsilloDto);
    return await this.bolsilloRepository.save(bolsillo);
  }

  async findAll(): Promise<Bolsillo[]> {
    return await this.bolsilloRepository.find({
      relations: ['presupuesto', 'encuentro'],
    });
  }

  async findOne(id: number): Promise<Bolsillo> {
    const bolsillo = await this.bolsilloRepository.findOne({
      where: { id },
      relations: ['presupuesto', 'encuentro'],
    });

    if (!bolsillo) {
      throw new NotFoundException(`Bolsillo con ID ${id} no encontrado`);
    }

    return bolsillo;
  }

  async findByEncuentro(idEncuentro: number): Promise<Bolsillo[]> {
    return await this.bolsilloRepository.find({
      where: { idEncuentro },
      relations: ['presupuesto', 'encuentro'],
    });
  }

  async findByPresupuesto(idPresupuesto: number): Promise<Bolsillo[]> {
    return await this.bolsilloRepository.find({
      where: { idPresupuesto },
      relations: ['presupuesto', 'encuentro'],
    });
  }

  async update(
    id: number,
    updateBolsilloDto: UpdateBolsilloDto,
  ): Promise<Bolsillo> {
    const bolsillo = await this.findOne(id);
    Object.assign(bolsillo, updateBolsilloDto);
    return await this.bolsilloRepository.save(bolsillo);
  }

  async remove(id: number): Promise<void> {
    const bolsillo = await this.findOne(id);
    await this.bolsilloRepository.remove(bolsillo);
  }
}
