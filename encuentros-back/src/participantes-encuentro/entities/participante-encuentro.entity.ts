import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Encuentro } from '../../encuentro/entities/encuentro.entity';
import { User } from '../../users/entities/user.entity';

@Entity('PARTICIPANTES_ENCUENTRO')
export class ParticipanteEncuentro {
  @PrimaryGeneratedColumn({ type: 'number', name: 'ID_PARTICIPACION' })
  id: number;

  @Column({ name: 'ID_ENCUENTRO', type: 'number', nullable: false })
  idEncuentro: number;

  @Column({ name: 'ID_USUARIO', type: 'number', nullable: false })
  idUsuario: number;

  @Column({ name: 'ROL', type: 'varchar2', length: 50, nullable: false })
  rol: string;

  @ManyToOne(() => Encuentro)
  @JoinColumn({ name: 'ID_ENCUENTRO' })
  encuentro: Encuentro;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ID_USUARIO' })
  usuario: User;
}
