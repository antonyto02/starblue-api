import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ImagenDestino } from './imagen-destino.entity';

@Entity('destinos')
export class Destino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ default: 'MX' })
  pais: string; // 'MX' | 'USA'

  @Column('text')
  descripcion: string;

  @Column({ nullable: true })
  imagenPortada: string;

  @Column({ type: 'text', nullable: true })
  direccionAbordaje: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ImagenDestino, (img) => img.destino, { cascade: true, eager: true })
  galeria: ImagenDestino[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
