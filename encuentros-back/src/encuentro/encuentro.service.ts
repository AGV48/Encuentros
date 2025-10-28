import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEncuentroDto } from './dto/create-encuentro.dto';
import { UpdateEncuentroDto } from './dto/update-encuentro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuentro } from './entities/encuentro.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class EncuentroService {
  constructor(
      @InjectRepository(Encuentro)
      private encuentrosRepository: Repository<Encuentro>,
      private dataSource: DataSource,
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

  async findAll(creadorId?: number) {
    if (creadorId) {
      // Obtener encuentros donde el usuario es creador O participante
      // Convertimos DESCRIPCION de CLOB a VARCHAR2 para evitar problemas con UNION
      const sql = `
        SELECT e.ID_ENCUENTRO, e.ID_CREADOR, e.TITULO, TO_CHAR(e.DESCRIPCION) as DESCRIPCION, e.LUGAR, e.FECHA, e.FECHA_CREACION
        FROM ENCUENTROS e
        WHERE e.ID_CREADOR = :1
        UNION
        SELECT e.ID_ENCUENTRO, e.ID_CREADOR, e.TITULO, TO_CHAR(e.DESCRIPCION) as DESCRIPCION, e.LUGAR, e.FECHA, e.FECHA_CREACION
        FROM ENCUENTROS e
        INNER JOIN PARTICIPANTES_ENCUENTRO pe ON e.ID_ENCUENTRO = pe.ID_ENCUENTRO
        WHERE pe.ID_USUARIO = :2
        ORDER BY FECHA DESC
      `;
      
      const result = await this.dataSource.query(sql, [creadorId, creadorId]);
      
      // Normalizar las propiedades de Oracle (mayúsculas) a camelCase
      return result.map((row: any) => ({
        id: row.ID_ENCUENTRO,
        idCreador: row.ID_CREADOR,
        titulo: row.TITULO,
        descripcion: row.DESCRIPCION,
        lugar: row.LUGAR,
        fecha: row.FECHA,
        fechaCreacion: row.FECHA_CREACION
      }));
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
