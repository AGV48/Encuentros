import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Encuentro } from '../../encuentro/entities/encuentro.entity';

@Entity('PRESUPUESTOS')
export class Presupuesto {
  @PrimaryGeneratedColumn({ name: 'ID_PRESUPUESTO' })
  id: number;

  @Column({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @Column({
    name: 'NOMBRE_ITEM',
    type: 'varchar2',
    length: 200,
    nullable: true,
  })
  nombreItem: string;

  @Column({
    name: 'MONTO_ITEM',
    type: 'number',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  montoItem: number;

  @ManyToOne(() => Encuentro)
  @JoinColumn({ name: 'ID_ENCUENTRO' })
  encuentro: Encuentro;
}
