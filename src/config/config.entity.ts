import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryColumn()
  clave: string;

  @Column({ type: 'text' })
  valor: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
