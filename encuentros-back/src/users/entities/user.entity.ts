import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('USUARIOS')
export class User {
  @PrimaryGeneratedColumn({ type: 'number', name: 'ID_USUARIO' })
  id: number;

  @Column({ name: 'NOMBRE', type: 'varchar2', length: 100, nullable: false })
  nombre: string;

  @Column({ name: 'APELLIDO', type: 'varchar2', length: 100, nullable: true })
  apellido: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 150, nullable: false })
  email: string;

  @Column({ name: 'CONTRASENA', type: 'varchar2', length: 200, nullable: false })
  contrasena: string;

  @Column({ name: 'IMAGEN_PERFIL', type: 'varchar2', length: 255, nullable: true })
  imagenPerfil: string | null;

  @Column({ name: 'FECHA_REGISTRO', type: 'timestamp', default: () => 'SYSDATE' })
  fechaRegistro: Date;
}
