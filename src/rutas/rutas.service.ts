import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from './ruta.entity';
import { RutaParada } from './ruta-parada.entity';
import { RutaTarifa } from './ruta-tarifa.entity';

interface ParadaDto {
  destinoId: string;
  orden: number;
  precioUSD?: number;
}

interface CrearRutaDto {
  nombre: string;
  descripcion?: string;
  paradas: ParadaDto[];
  diasSemana?: number[];
  duracionDias?: number;
  cupoDefault?: number;
}

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Ruta)
    private rutasRepo: Repository<Ruta>,
    @InjectRepository(RutaParada)
    private paradasRepo: Repository<RutaParada>,
    @InjectRepository(RutaTarifa)
    private tarifasRepo: Repository<RutaTarifa>,
  ) {}

  findAll() {
    return this.rutasRepo.find({ order: { nombre: 'ASC' } });
  }

  findActivas() {
    return this.rutasRepo.find({ where: { activa: true }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const ruta = await this.rutasRepo.findOne({ where: { id } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');
    return ruta;
  }

  async crear(dto: CrearRutaDto) {
    // 1. Create ruta + paradas
    const ruta = this.rutasRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      ...(dto.diasSemana  !== undefined && { diasSemana:  dto.diasSemana }),
      ...(dto.duracionDias !== undefined && { duracionDias: dto.duracionDias }),
      ...(dto.cupoDefault  !== undefined && { cupoDefault:  dto.cupoDefault }),
      paradas: dto.paradas.map((p) => this.paradasRepo.create({ destinoId: p.destinoId, orden: p.orden })),
    });
    const saved = await this.rutasRepo.save(ruta);
    const reloaded = await this.rutasRepo.findOne({ where: { id: saved.id } });
    await this.generarTarifas(saved.id, reloaded!.paradas, dto.paradas);
    return reloaded!;
  }

  async actualizar(id: string, dto: Partial<CrearRutaDto>) {
    const ruta = await this.findOne(id);

    if (dto.nombre       !== undefined) ruta.nombre       = dto.nombre;
    if (dto.descripcion  !== undefined) ruta.descripcion  = dto.descripcion;
    if (dto.diasSemana   !== undefined) ruta.diasSemana   = dto.diasSemana;
    if (dto.duracionDias !== undefined) ruta.duracionDias = dto.duracionDias;
    if (dto.cupoDefault  !== undefined) ruta.cupoDefault  = dto.cupoDefault;

    if (dto.paradas) {
      await this.tarifasRepo.delete({ rutaId: id });
      await this.paradasRepo.delete({ rutaId: id });

      ruta.paradas = dto.paradas.map((p) => this.paradasRepo.create({ ...p, rutaId: id }));
      ruta.tarifas = [];

      const saved = await this.rutasRepo.save(ruta);
      const reloaded = await this.rutasRepo.findOne({ where: { id: saved.id } });
      await this.generarTarifas(saved.id, reloaded!.paradas, dto.paradas);
      return reloaded!;
    }

    return this.rutasRepo.save(ruta);
  }

  // Genera tarifas: cada parada MX → cada parada USA con su precio
  private async generarTarifas(
    rutaId: string,
    paradasGuardadas: import('./ruta-parada.entity').RutaParada[],
    paradasDto: ParadaDto[],
  ) {
    const sorted = [...paradasGuardadas].sort((a, b) => a.orden - b.orden);

    const mxParadas  = sorted.filter(p => p.destino?.pais !== 'USA');
    const usaParadas = sorted.filter(p => p.destino?.pais === 'USA');

    if (mxParadas.length === 0 || usaParadas.length === 0) return;

    const tarifas: RutaTarifa[] = [];

    for (const usaParada of usaParadas) {
      // Find the price for this USA stop from the DTO (matched by orden)
      const dto = paradasDto.find(p => p.orden === usaParada.orden);
      if (!dto?.precioUSD) continue;

      for (const mxParada of mxParadas) {
        tarifas.push(this.tarifasRepo.create({
          rutaId,
          paradaOrigenId:  mxParada.id,
          paradaDestinoId: usaParada.id,
          precioUSD:       dto.precioUSD,
        }));
      }
    }

    if (tarifas.length > 0) {
      await this.tarifasRepo.save(tarifas);
    }
  }

  async toggleActiva(id: string) {
    const ruta = await this.findOne(id);
    await this.rutasRepo.update(id, { activa: !ruta.activa });
    return this.findOne(id);
  }

  async eliminar(id: string) {
    await this.findOne(id);
    await this.rutasRepo.delete(id);
    return { message: 'Ruta eliminada' };
  }

  // ─── Tarifas (read only, for salida creation) ───
  async findTarifas(rutaId: string) {
    await this.findOne(rutaId);
    return this.tarifasRepo.find({ where: { rutaId } });
  }
}
