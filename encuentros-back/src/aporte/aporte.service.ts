import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';
import { Aporte } from './entities/aporte.entity';

@Injectable()
export class AporteService {
  constructor(
    @InjectRepository(Aporte)
    private aporteRepository: Repository<Aporte>,
  ) {}

  create(createAporteDto: CreateAporteDto) {
    const aporte = this.aporteRepository.create(createAporteDto);
    return this.aporteRepository.save(aporte);
  }

  findAll() {
    return this.aporteRepository.find({
      relations: ['bolsillo', 'encuentro', 'usuario'],
    });
  }

  findByEncuentro(idEncuentro: number) {
    return this.aporteRepository.find({
      where: { idEncuentro },
      relations: ['bolsillo', 'usuario'],
    });
  }

  findByBolsillo(idBolsillo: number) {
    return this.aporteRepository.find({
      where: { idBolsillo },
      relations: ['usuario', 'encuentro'],
    });
  }

  findByUsuario(idUsuario: number) {
    return this.aporteRepository.find({
      where: { idUsuario },
      relations: ['bolsillo', 'encuentro'],
    });
  }

  findOne(id: number) {
    return this.aporteRepository.findOne({
      where: { id },
      relations: ['bolsillo', 'encuentro', 'usuario'],
    });
  }

  async update(id: number, updateAporteDto: UpdateAporteDto) {
    await this.aporteRepository.update(id, updateAporteDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.aporteRepository.delete(id);
  }
}
