import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEncuentroDto } from './dto/create-encuentro.dto';
import { UpdateEncuentroDto } from './dto/update-encuentro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuentro } from './entities/encuentro.entity';
import { EncuentroResumen } from './entities/encuentro-resumen.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class EncuentroService {
  constructor(
      @InjectRepository(Encuentro)
      private encuentrosRepository: Repository<Encuentro>,
      @InjectRepository(EncuentroResumen)
      private encuentroResumenRepository: Repository<EncuentroResumen>,
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

  async findAllWithResumen(creadorId?: number) {
    // Consulta simplificada: solo usa la vista para participantes y presupuesto
    // Evita duplicados por múltiples bolsillos usando DISTINCT o agrupando
    if (creadorId) {
      const sql = `
        SELECT DISTINCT
          e.ID_ENCUENTRO,
          e.ID_CREADOR,
          e.TITULO,
          TO_CHAR(e.DESCRIPCION) as DESCRIPCION,
          e.LUGAR,
          e.FECHA,
          e.FECHA_CREACION,
          NVL(p.ID_PRESUPUESTO, NULL) AS ID_PRESUPUESTO,
          NVL(p.PRESUPUESTO_TOTAL, 0) AS PRESUPUESTO_TOTAL,
          NVL((
            SELECT COUNT(*) 
            FROM PARTICIPANTES_ENCUENTRO pe2 
            WHERE pe2.ID_ENCUENTRO = e.ID_ENCUENTRO
          ), 0) AS CANT_PARTICIPANTES
        FROM ENCUENTROS e
        LEFT JOIN PRESUPUESTOS p ON e.ID_ENCUENTRO = p.ID_ENCUENTRO
        WHERE e.ID_ENCUENTRO IN (
          SELECT e2.ID_ENCUENTRO 
          FROM ENCUENTROS e2 
          WHERE e2.ID_CREADOR = :1
          UNION
          SELECT pe.ID_ENCUENTRO 
          FROM PARTICIPANTES_ENCUENTRO pe 
          WHERE pe.ID_USUARIO = :2
        )
        ORDER BY e.FECHA DESC
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
        fechaCreacion: row.FECHA_CREACION,
        idPresupuesto: row.ID_PRESUPUESTO,
        presupuestoTotal: row.PRESUPUESTO_TOTAL,
        cantParticipantes: row.CANT_PARTICIPANTES
      }));
    }
    
    // Si no hay filtro, devolver todos los registros
    const result = await this.dataSource.query(`
      SELECT DISTINCT
        e.ID_ENCUENTRO,
        e.ID_CREADOR,
        e.TITULO,
        TO_CHAR(e.DESCRIPCION) as DESCRIPCION,
        e.LUGAR,
        e.FECHA,
        e.FECHA_CREACION,
        NVL(p.ID_PRESUPUESTO, NULL) AS ID_PRESUPUESTO,
        NVL(p.PRESUPUESTO_TOTAL, 0) AS PRESUPUESTO_TOTAL,
        NVL((
          SELECT COUNT(*) 
          FROM PARTICIPANTES_ENCUENTRO pe 
          WHERE pe.ID_ENCUENTRO = e.ID_ENCUENTRO
        ), 0) AS CANT_PARTICIPANTES
      FROM ENCUENTROS e
      LEFT JOIN PRESUPUESTOS p ON e.ID_ENCUENTRO = p.ID_ENCUENTRO
      ORDER BY e.FECHA DESC
    `);
    
    return result.map((row: any) => ({
      id: row.ID_ENCUENTRO,
      idCreador: row.ID_CREADOR,
      titulo: row.TITULO,
      descripcion: row.DESCRIPCION,
      lugar: row.LUGAR,
      fecha: row.FECHA,
      fechaCreacion: row.FECHA_CREACION,
      idPresupuesto: row.ID_PRESUPUESTO,
      presupuestoTotal: row.PRESUPUESTO_TOTAL,
      cantParticipantes: row.CANT_PARTICIPANTES
    }));
  }

  update(id: number, updateEncuentroDto: UpdateEncuentroDto) {
    return `This action updates a #${id} encuentro`;
  }

  remove(id: number) {
    return `This action removes a #${id} encuentro`;
  }
}
