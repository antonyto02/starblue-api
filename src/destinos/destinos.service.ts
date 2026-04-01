import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destino } from './destino.entity';
import { ImagenDestino } from './imagen-destino.entity';

@Injectable()
export class DestinosService {
  constructor(
    @InjectRepository(Destino)
    private destinosRepo: Repository<Destino>,
    @InjectRepository(ImagenDestino)
    private imagenesRepo: Repository<ImagenDestino>,
  ) {}

  findAll() {
    return this.destinosRepo.find({ where: { activo: true }, order: { createdAt: 'DESC' } });
  }

  findAllAdmin() {
    return this.destinosRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const destino = await this.destinosRepo.findOne({ where: { id } });
    if (!destino) throw new NotFoundException('Destino no encontrado');
    return destino;
  }

  create(data: Partial<Destino>) {
    const destino = this.destinosRepo.create(data);
    return this.destinosRepo.save(destino);
  }

  async update(id: string, data: Partial<Destino>) {
    await this.findOne(id);
    await this.destinosRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.destinosRepo.delete(id);
    return { message: 'Destino eliminado' };
  }

  // Galería
  async addImagen(destinoId: string, url: string) {
    await this.findOne(destinoId);
    const count = await this.imagenesRepo.count({ where: { destinoId } });
    const imagen = this.imagenesRepo.create({ destinoId, url, orden: count });
    return this.imagenesRepo.save(imagen);
  }

  async removeImagen(imagenId: string) {
    const imagen = await this.imagenesRepo.findOne({ where: { id: imagenId } });
    if (!imagen) throw new NotFoundException('Imagen no encontrada');
    await this.imagenesRepo.delete(imagenId);
    return { message: 'Imagen eliminada' };
  }

  async reordenarGaleria(destinoId: string, orden: { id: string; orden: number }[]) {
    await Promise.all(orden.map(({ id, orden }) => this.imagenesRepo.update(id, { orden })));
    return this.findOne(destinoId);
  }
}
