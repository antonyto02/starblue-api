import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { RutaParada } from './ruta-parada.entity';
import { RutaTarifa } from './ruta-tarifa.entity';

@Entity('rutas')
export class Ruta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activa: boolean;

  // Días de la semana en que sale este viaje (0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb)
  @Column({ type: 'int', array: true, default: () => "'{}'", name: 'dias_semana' })
  diasSemana: number[];

  // Cuántos días dura el viaje (para calcular fechaRegreso automáticamente)
  @Column({ type: 'int', default: 1, name: 'duracion_dias' })
  duracionDias: number;

  // Cupo por defecto al generar salidas
  @Column({ type: 'int', default: 45, name: 'cupo_default' })
  cupoDefault: number;

  @OneToMany(() => RutaParada, (p) => p.ruta, { cascade: true, eager: true })
  paradas: RutaParada[];

  @OneToMany(() => RutaTarifa, (t) => t.ruta, { cascade: true, eager: false })
  tarifas: RutaTarifa[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
