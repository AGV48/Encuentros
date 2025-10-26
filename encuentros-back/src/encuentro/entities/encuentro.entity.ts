import { Entity, PrimaryGeneratedColumn, Column, Timestamp } from 'typeorm';

@Entity('ENCUENTROS')
export class Encuentro {
  @PrimaryGeneratedColumn({ type: 'number', name: 'ID_ENCUENTRO' })
  id: number;

  @Column({ name: 'ID_CREADOR', type: 'number', nullable: false })
  idCreador: number;

  @Column({ name: 'TITULO', type: 'varchar2', length: 200, nullable: false })
  titulo: string;

  @Column({ name: 'DESCRIPCION', type: 'varchar2', length: 500, nullable: false })
  descripcion: string;

  @Column({ name: 'LUGAR', type: 'varchar2', length: 100, nullable: false })
  lugar: string;

  @Column({ name: 'FECHA', type: 'timestamp', nullable: false })
  fecha: Date;


  @Column({ name: 'FECHA_CREACION', type: 'timestamp', nullable: false })
  fechaCreacion: Timestamp;

}
