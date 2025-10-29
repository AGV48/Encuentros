import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Presupuesto } from './presupuesto.entity';
import { Encuentro } from '../../encuentro/entities/encuentro.entity';

@Entity('ITEMS_PRESUPUESTO')
export class ItemPresupuesto {
  @PrimaryGeneratedColumn({ name: 'ID_ITEM' })
  id: number;

  @Column({ name: 'ID_PRESUPUESTO' })
  idPresupuesto: number;

  @Column({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @Column({
    name: 'NOMBRE_ITEM',
    type: 'varchar2',
    length: 200,
  })
  nombreItem: string;

  @Column({
    name: 'MONTO_ITEM',
    type: 'number',
    precision: 15,
    scale: 2,
  })
  montoItem: number;

  @ManyToOne(() => Presupuesto)
  @JoinColumn({ name: 'ID_PRESUPUESTO' })
  presupuesto: Presupuesto;

  @ManyToOne(() => Encuentro)
  @JoinColumn({ name: 'ID_ENCUENTRO' })
  encuentro: Encuentro;
}
