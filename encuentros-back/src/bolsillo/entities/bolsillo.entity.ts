import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Presupuesto } from '../../presupuesto/entities/presupuesto.entity';
import { Encuentro } from '../../encuentro/entities/encuentro.entity';

@Entity('BOLSILLOS')
export class Bolsillo {
  @PrimaryGeneratedColumn({ name: 'ID_BOLSILLO' })
  id: number;

  @Column({ name: 'ID_PRESUPUESTO', nullable: true })
  idPresupuesto: number;

  @Column({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @Column({ name: 'NOMBRE', type: 'varchar2', length: 200 })
  nombre: string;

  @Column({
    name: 'SALDO_ACTUAL',
    type: 'number',
    precision: 15,
    scale: 2,
    default: 0,
  })
  saldoActual: number;

  @ManyToOne(() => Presupuesto)
  @JoinColumn({ name: 'ID_PRESUPUESTO' })
  presupuesto: Presupuesto;

  @ManyToOne(() => Encuentro)
  @JoinColumn({ name: 'ID_ENCUENTRO' })
  encuentro: Encuentro;
}
