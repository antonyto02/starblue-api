import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Salida } from '../salidas/salida.entity';
import { User } from '../users/user.entity';
import { RutaParada } from '../rutas/ruta-parada.entity';

export enum EstadoReservacion {
  PENDIENTE  = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA  = 'CANCELADA',
}

@Entity('reservaciones')
export class Reservacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Salida, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'salida_id' })
  salida: Salida;

  @Column({ name: 'salida_id' })
  salidaId: string;

  // Parada donde aborda el pasajero
  @ManyToOne(() => RutaParada, { onDelete: 'SET NULL', nullable: true, eager: true })
  @JoinColumn({ name: 'parada_origen_id' })
  paradaOrigen: RutaParada | null;

  @Column({ name: 'parada_origen_id', nullable: true })
  paradaOrigenId: string | null;

  // Parada donde baja el pasajero
  @ManyToOne(() => RutaParada, { onDelete: 'SET NULL', nullable: true, eager: true })
  @JoinColumn({ name: 'parada_destino_id' })
  paradaDestino: RutaParada | null;

  @Column({ name: 'parada_destino_id', nullable: true })
  paradaDestinoId: string | null;

  // Precio por persona al momento de reservar (snapshot de la tarifa)
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  precioUnitario: number | null;

  // Asientos asignados al confirmar (uno por pasajero)
  @Column({ name: 'asientos_asignados', type: 'int', array: true, nullable: true })
  asientosAsignados: number[] | null;

  // Empleado que registró la reserva (null = reserva pública)
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'empleado_id' })
  empleado: User | null;

  @Column({ name: 'empleado_id', nullable: true })
  empleadoId: string | null;

  @Column()
  nombreCompleto: string;

  @Column()
  telefono: string;

  @Column()
  email: string;

  // Desglose de pasajeros por edad
  @Column({ type: 'int', default: 1 })
  adultos: number;

  @Column({ type: 'int', default: 0 })
  menores9: number;   // 4-9 años: precio - $10 DLLS

  @Column({ type: 'int', default: 0 })
  menores3: number;   // <3 años: 50% del precio

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'enum', enum: EstadoReservacion, default: EstadoReservacion.PENDIENTE })
  estado: EstadoReservacion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
