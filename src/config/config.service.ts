import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './config.entity';

@Injectable()
export class ConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(Configuracion)
    private repo: Repository<Configuracion>,
  ) {}

  // Seed default values on first boot
  async onModuleInit() {
    await this.repo.upsert(
      { clave: 'tipo_cambio', valor: '20' },
      { conflictPaths: ['clave'], skipUpdateIfNoValuesChanged: true },
    );
  }

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.repo.find();
    return Object.fromEntries(rows.map(r => [r.clave, r.valor]));
  }

  async get(clave: string): Promise<string | null> {
    const row = await this.repo.findOne({ where: { clave } });
    return row?.valor ?? null;
  }

  async getTipoCambio(): Promise<number> {
    const val = await this.get('tipo_cambio');
    return parseFloat(val ?? '20');
  }

  async update(clave: string, valor: string): Promise<void> {
    await this.repo.upsert({ clave, valor }, { conflictPaths: ['clave'] });
  }

  async updateMany(data: Record<string, string>): Promise<void> {
    for (const [clave, valor] of Object.entries(data)) {
      await this.update(clave, valor);
    }
  }
}
