import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Bolsillo } from '../../bolsillo/entities/bolsillo.entity';
import { Encuentro } from '../../encuentro/entities/encuentro.entity';
import { User } from '../../users/entities/user.entity';

@Entity('APORTES')
export class Aporte {
  @PrimaryGeneratedColumn({ name: 'ID_APORTE' })
  id: number;

  @Column({ name: 'ID_BOLSILLO', nullable: true })
  idBolsillo: number;

  @Column({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @Column({ name: 'ID_USUARIO', nullable: true })
  idUsuario: number;

  @Column({ name: 'MONTO', type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @CreateDateColumn({
    name: 'FECHA_APORTE',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAporte: Date;

  @ManyToOne(() => Bolsillo, { nullable: true })
  @JoinColumn({ name: 'ID_BOLSILLO' })
  bolsillo: Bolsillo;

  @ManyToOne(() => Encuentro)
  @JoinColumn({ name: 'ID_ENCUENTRO' })
  encuentro: Encuentro;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'ID_USUARIO' })
  usuario: User;
}
