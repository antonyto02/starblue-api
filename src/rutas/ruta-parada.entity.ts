import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Ruta } from './ruta.entity';
import { Destino } from '../destinos/destino.entity';

@Entity('ruta_paradas')
export class RutaParada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ruta, (r) => r.paradas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruta_id' })
  ruta: Ruta;

  @Column({ name: 'ruta_id' })
  rutaId: string;

  @ManyToOne(() => Destino, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'destino_id' })
  destino: Destino;

  @Column({ name: 'destino_id' })
  destinoId: string;

  @Column({ type: 'int' })
  orden: number;

  @Column({ default: true })
  activa: boolean;
}
