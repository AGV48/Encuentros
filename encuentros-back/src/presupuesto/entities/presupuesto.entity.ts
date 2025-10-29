import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Encuentro } from '../../encuentro/entities/encuentro.entity';
import { ItemPresupuesto } from './item-presupuesto.entity';

@Entity('PRESUPUESTOS')
export class Presupuesto {
  @PrimaryGeneratedColumn({ name: 'ID_PRESUPUESTO' })
  id: number;

  @Column({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @Column({
    name: 'PRESUPUESTO_TOTAL',
    type: 'number',
    precision: 15,
    scale: 2,
    default: 0,
  })
  presupuestoTotal: number;

  @ManyToOne(() => Encuentro)
  @JoinColumn({ name: 'ID_ENCUENTRO' })
  encuentro: Encuentro;

  @OneToMany(() => ItemPresupuesto, (item) => item.presupuesto)
  items: ItemPresupuesto[];
}
