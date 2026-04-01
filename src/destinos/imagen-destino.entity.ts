import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Destino } from './destino.entity';

@Entity('imagenes_destino')
export class ImagenDestino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Destino, (destino) => destino.galeria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destino_id' })
  destino: Destino;

  @Column({ name: 'destino_id' })
  destinoId: string;

  @Column()
  url: string;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
