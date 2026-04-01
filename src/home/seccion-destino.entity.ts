import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SeccionHome } from './seccion-home.entity';
import { Destino } from '../destinos/destino.entity';

@Entity('secciones_destinos')
export class SeccionDestino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SeccionHome, (s) => s.destinos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seccion_id' })
  seccion: SeccionHome;

  @Column({ name: 'seccion_id' })
  seccionId: string;

  @ManyToOne(() => Destino, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'destino_id' })
  destino: Destino;

  @Column({ name: 'destino_id' })
  destinoId: string;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
