import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Ruta } from '../rutas/ruta.entity';

export enum EstadoSalida {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
}

@Entity('salidas')
export class Salida {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ruta, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'ruta_id' })
  ruta: Ruta;

  @Column({ name: 'ruta_id' })
  rutaId: string;

  @Column({ type: 'date' })
  fechaSalida: string;

  @Column({ type: 'date' })
  fechaRegreso: string;

  @Column({ type: 'int' })
  cupoTotal: number;

  @Column({ type: 'enum', enum: EstadoSalida, default: EstadoSalida.ABIERTA })
  estado: EstadoSalida;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
