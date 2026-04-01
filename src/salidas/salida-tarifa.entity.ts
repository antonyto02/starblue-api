import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Salida } from '../salidas/salida.entity';
import { RutaParada } from '../rutas/ruta-parada.entity';

@Entity('salida_tarifas')
export class SalidaTarifa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Salida, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salida_id' })
  salida: Salida;

  @Column({ name: 'salida_id' })
  salidaId: string;

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
