import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Salida, EstadoSalida } from './salida.entity';
import { SalidaTarifa } from './salida-tarifa.entity';
import { RutaTarifa } from '../rutas/ruta-tarifa.entity';
import { Ruta } from '../rutas/ruta.entity';

@Injectable()
export class SalidasService {
  constructor(
    @InjectRepository(Salida)
    private salidasRepo: Repository<Salida>,
    @InjectRepository(SalidaTarifa)
    private salidaTarifasRepo: Repository<SalidaTarifa>,
    @InjectRepository(RutaTarifa)
    private rutaTarifasRepo: Repository<RutaTarifa>,
    @InjectRepository(Ruta)
    private rutasRepo: Repository<Ruta>,
  ) {}

  findProximas() {
    const hoy = new Date().toISOString().split('T')[0];
    return this.salidasRepo.find({
      where: { estado: EstadoSalida.ABIERTA, fechaSalida: MoreThan(hoy) as any },
      order: { fechaSalida: 'ASC' },
    });
  }

  findProximasByRuta(rutaId: string) {
    const hoy = new Date().toISOString().split('T')[0];
    return this.salidasRepo.find({
      where: { rutaId, estado: EstadoSalida.ABIERTA, fechaSalida: MoreThan(hoy) as any },
      order: { fechaSalida: 'ASC' },
    });
  }

  findAll() {
    return this.salidasRepo.find({ order: { fechaSalida: 'ASC' } });
  }

  findByRuta(rutaId: string) {
    return this.salidasRepo.find({ where: { rutaId }, order: { fechaSalida: 'ASC' } });
  }

  async findOne(id: string) {
    const salida = await this.salidasRepo.findOne({ where: { id } });
    if (!salida) throw new NotFoundException('Salida no encontrada');
    return salida;
  }

  async create(data: Partial<Salida>) {
    const salida = this.salidasRepo.create(data);
    const saved = await this.salidasRepo.save(salida);

    // Auto-copy ruta_tarifas → salida_tarifas as starting point
    if (saved.rutaId) {
      const rutaTarifas = await this.rutaTarifasRepo.find({ where: { rutaId: saved.rutaId } });
      if (rutaTarifas.length > 0) {
        const salidaTarifas = rutaTarifas.map(t =>
          this.salidaTarifasRepo.create({
            salidaId:        saved.id,
            paradaOrigenId:  t.paradaOrigenId,
            paradaDestinoId: t.paradaDestinoId,
            precioUSD:       t.precioUSD,
          }),
        );
        await this.salidaTarifasRepo.save(salidaTarifas);
      }
    }

    return saved;
  }

  async update(id: string, data: Partial<Salida>) {
    await this.findOne(id);
    await this.salidasRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.salidasRepo.delete(id);
    return { message: 'Salida eliminada' };
  }

  /* ─── Tarifas por salida ─── */

  getTarifas(salidaId: string) {
    return this.salidaTarifasRepo.find({ where: { salidaId } });
  }

  async createTarifa(salidaId: string, dto: {
    paradaOrigenId: string;
    paradaDestinoId: string;
    precioUSD: number;
  }) {
    await this.findOne(salidaId);
    await this.salidaTarifasRepo.delete({
      salidaId,
      paradaOrigenId: dto.paradaOrigenId,
      paradaDestinoId: dto.paradaDestinoId,
    });
    const t = this.salidaTarifasRepo.create({ salidaId, ...dto });
    return this.salidaTarifasRepo.save(t);
  }

  async updateTarifa(salidaId: string, tarifaId: string, dto: { precioUSD: number }) {
    const t = await this.salidaTarifasRepo.findOne({ where: { id: tarifaId, salidaId } });
    if (!t) throw new NotFoundException('Tarifa no encontrada');
    Object.assign(t, dto);
    return this.salidaTarifasRepo.save(t);
  }

  async deleteTarifa(salidaId: string, tarifaId: string) {
    const t = await this.salidaTarifasRepo.findOne({ where: { id: tarifaId, salidaId } });
    if (!t) throw new NotFoundException('Tarifa no encontrada');
    await this.salidaTarifasRepo.delete(tarifaId);
    return { message: 'Tarifa eliminada' };
  }

  /* ─── Generación masiva de salidas ─── */

  async generarSalidas(dto: {
    rutaId: string;
    fechaInicio: string;
    fechaFin: string;
    cupoTotal?: number;
  }) {
    const ruta = await this.rutasRepo.findOne({ where: { id: dto.rutaId } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    const diasSemana: number[] = ruta.diasSemana ?? [];
    if (diasSemana.length === 0) {
      return { creadas: 0, salidas: [], mensaje: 'La ruta no tiene días de semana configurados.' };
    }

    const cupo = dto.cupoTotal ?? ruta.cupoDefault ?? 45;
    const creadas: Salida[] = [];

    const current = new Date(dto.fechaInicio + 'T12:00:00');
    const fin     = new Date(dto.fechaFin     + 'T12:00:00');

    while (current <= fin) {
      const diaSemana = current.getDay(); // 0=Dom … 6=Sáb
      if (diasSemana.includes(diaSemana)) {
        const fechaSalida = current.toISOString().split('T')[0];
        const regresoDate = new Date(current);
        regresoDate.setDate(regresoDate.getDate() + (ruta.duracionDias ?? 1));
        const fechaRegreso = regresoDate.toISOString().split('T')[0];

        const salida = await this.create({
          rutaId: ruta.id,
          fechaSalida,
          fechaRegreso,
          cupoTotal: cupo,
        });
        creadas.push(salida);
      }
      current.setDate(current.getDate() + 1);
    }

    return { creadas: creadas.length, salidas: creadas };
  }
}
