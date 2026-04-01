import { Injectable, NotFoundException, ConflictException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeccionHome, TipoSeccion } from './seccion-home.entity';
import { SeccionDestino } from './seccion-destino.entity';

const SECCIONES_FIJAS = [
  { tipo: TipoSeccion.BANNER,          titulo: 'Banner principal',    orden: 0 },
  { tipo: TipoSeccion.PROXIMAS_SALIDAS, titulo: 'Próximos viajes',    orden: 1 },
  { tipo: TipoSeccion.DESTACADOS,      titulo: 'Destinos destacados', orden: 2 },
];

@Injectable()
export class HomeService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(SeccionHome)
    private seccionesRepo: Repository<SeccionHome>,
    @InjectRepository(SeccionDestino)
    private seccionDestinoRepo: Repository<SeccionDestino>,
  ) {}

  async onApplicationBootstrap() {
    for (const fija of SECCIONES_FIJAS) {
      const existe = await this.seccionesRepo.findOne({ where: { tipo: fija.tipo } });
      if (!existe) {
        await this.seccionesRepo.save(this.seccionesRepo.create(fija));
      }
    }
  }

  // Público: secciones activas ordenadas
  getLayout() {
    return this.seccionesRepo.find({
      where: { activo: true },
      order: { orden: 'ASC' },
    });
  }

  // Admin: todas las secciones
  getAll() {
    return this.seccionesRepo.find({ order: { orden: 'ASC' } });
  }

  async findOne(id: string) {
    const s = await this.seccionesRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Sección no encontrada');
    return s;
  }

  create(data: { titulo: string; tipo?: TipoSeccion }) {
    const seccion = this.seccionesRepo.create(data);
    return this.seccionesRepo.save(seccion);
  }

  async update(id: string, data: Partial<SeccionHome>) {
    await this.findOne(id);
    await this.seccionesRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const s = await this.findOne(id);
    const tiposFijos = SECCIONES_FIJAS.map((f) => f.tipo);
    if (tiposFijos.includes(s.tipo as TipoSeccion)) {
      throw new ConflictException('Las secciones fijas no se pueden eliminar');
    }
    await this.seccionesRepo.delete(id);
    return { message: 'Sección eliminada' };
  }

  async reordenarSecciones(orden: { id: string; orden: number }[]) {
    const banner = await this.seccionesRepo.findOne({ where: { tipo: TipoSeccion.BANNER } });
    await Promise.all(
      orden
        .filter(({ id }) => id !== banner?.id)
        .map(({ id, orden: o }) => this.seccionesRepo.update(id, { orden: o })),
    );
    return this.getAll();
  }

  // Destinos dentro de una sección
  async addDestino(seccionId: string, destinoId: string) {
    await this.findOne(seccionId);
    const existe = await this.seccionDestinoRepo.findOne({ where: { seccionId, destinoId } });
    if (existe) throw new ConflictException('El destino ya está en esta sección');
    const count = await this.seccionDestinoRepo.count({ where: { seccionId } });
    const sd = this.seccionDestinoRepo.create({ seccionId, destinoId, orden: count });
    await this.seccionDestinoRepo.save(sd);
    return this.findOne(seccionId);
  }

  async removeDestino(seccionId: string, destinoId: string) {
    await this.seccionDestinoRepo.delete({ seccionId, destinoId });
    return this.findOne(seccionId);
  }

  async reordenarDestinos(seccionId: string, orden: { id: string; orden: number }[]) {
    await Promise.all(orden.map(({ id, orden }) => this.seccionDestinoRepo.update(id, { orden })));
    return this.findOne(seccionId);
  }
}
