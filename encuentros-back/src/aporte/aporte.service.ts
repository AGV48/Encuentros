import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';
import { Aporte } from './entities/aporte.entity';

@Injectable()
export class AporteService {
  constructor(
    @InjectRepository(Aporte)
    private aporteRepository: Repository<Aporte>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

  async agregarAporte(createAporteDto: CreateAporteDto): Promise<Aporte> {
    // Validar que todos los campos requeridos estén presentes
    if (!createAporteDto.idBolsillo || !createAporteDto.idUsuario) {
      throw new Error(
        'Los campos idBolsillo e idUsuario son requeridos para agregar un aporte',
      );
    }

    // Llamar al procedimiento almacenado
    await this.dataSource.query(
      `BEGIN agregar_aporte(:p_id_bolsillo, :p_id_encuentro, :p_id_usuario, :p_monto); END;`,
      [
        createAporteDto.idBolsillo,
        createAporteDto.idEncuentro,
        createAporteDto.idUsuario,
        createAporteDto.monto,
      ],
    );

    // Obtener el aporte recién creado
    const aporte = await this.aporteRepository.findOne({
      where: {
        idBolsillo: createAporteDto.idBolsillo,
        idUsuario: createAporteDto.idUsuario,
        idEncuentro: createAporteDto.idEncuentro,
      },
      relations: ['bolsillo', 'usuario', 'encuentro'],
      order: { id: 'DESC' },
    });

    if (!aporte) {
      throw new NotFoundException('No se pudo crear el aporte');
    }

    return aporte;
  }
}
