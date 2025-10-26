import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEncuentroDto } from './dto/create-encuentro.dto';
import { UpdateEncuentroDto } from './dto/update-encuentro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuentro } from './entities/encuentro.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EncuentroService {
  constructor(
      @InjectRepository(Encuentro)
      private encuentrosRepository: Repository<Encuentro>,
    ) {}
  async create(createEncuentroDto: CreateEncuentroDto) {
    // Usar el procedimiento almacenado `crear_encuentro` en la base de datos
    // Parámetros: p_id_creador, p_titulo, p_descripcion, p_lugar, p_fecha
    const { idCreador, titulo, descripcion, lugar, fecha } = createEncuentroDto as any;
    try {
      // Llamada PL/SQL. Asegurarse de pasar un objeto Date para el parámetro fecha
      const sql = `BEGIN crear_encuentro(:1, :2, :3, :4, :5); END;`;
      const fechaParam = fecha ? (fecha instanceof Date ? fecha : new Date(fecha)) : null;
      // Validación: la fecha no puede ser pasada
      if (fechaParam && fechaParam.getTime() < Date.now()) {
        throw new BadRequestException('La fecha del encuentro no puede ser anterior a la fecha actual');
      }
      await this.encuentrosRepository.query(sql, [idCreador, titulo, descripcion, lugar, fechaParam]);
      return { success: true };
    } catch (err) {
      // Re-lanzar para que el controlador/Nest maneje el error y devuelva 500/appropriate
      throw err;
    }
  }

  findAll(creadorId?: number) {
    if (creadorId) {
      return this.encuentrosRepository.find({ where: { idCreador: creadorId } });
    }
    return this.encuentrosRepository.find();
  }

  findOne(id: number) {
    return this.encuentrosRepository.findOne({ where: { id } });
  }

  update(id: number, updateEncuentroDto: UpdateEncuentroDto) {
    return `This action updates a #${id} encuentro`;
  }

  remove(id: number) {
    return `This action removes a #${id} encuentro`;
  }
}
