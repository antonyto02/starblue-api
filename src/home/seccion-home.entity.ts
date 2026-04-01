import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { SeccionDestino } from './seccion-destino.entity';

export enum TipoSeccion {
  BANNER = 'BANNER',
  DESTACADOS = 'DESTACADOS',
  PROXIMAS_SALIDAS = 'PROXIMAS_SALIDAS',
  PERSONALIZADA = 'PERSONALIZADA',
}

@Entity('secciones_home')
export class SeccionHome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'enum', enum: TipoSeccion, default: TipoSeccion.PERSONALIZADA })
  tipo: TipoSeccion;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => SeccionDestino, (sd) => sd.seccion, { cascade: true, eager: true })
  destinos: SeccionDestino[];

  @CreateDateColumn()
  createdAt: Date;
}
