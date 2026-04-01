import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Ruta } from './ruta.entity';
import { RutaParada } from './ruta-parada.entity';

@Entity('ruta_tarifas')
export class RutaTarifa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ruta, (r) => r.tarifas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruta_id' })
  ruta: Ruta;

  @Column({ name: 'ruta_id' })
  rutaId: string;

  @ManyToOne(() => RutaParada, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'parada_origen_id' })
  paradaOrigen: RutaParada;

  @Column({ name: 'parada_origen_id' })
  paradaOrigenId: string;

  @ManyToOne(() => RutaParada, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'parada_destino_id' })
  paradaDestino: RutaParada;

  @Column({ name: 'parada_destino_id' })
  paradaDestinoId: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'precio_usd' })
  precioUSD: number;
}
