import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DestinosService } from './destinos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('destinos')
export class DestinosController {
  constructor(private destinosService: DestinosService) {}

  @Get()
  findAll() {
    return this.destinosService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/todos')
  findAllAdmin() {
    return this.destinosService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.destinosService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.destinosService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.destinosService.remove(id);
  }

  // Galería
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/galeria')
  addImagen(@Param('id') id: string, @Body() body: { url: string }) {
    return this.destinosService.addImagen(id, body.url);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('galeria/:imagenId')
  removeImagen(@Param('imagenId') imagenId: string) {
    return this.destinosService.removeImagen(imagenId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/galeria/orden')
  reordenar(@Param('id') id: string, @Body() body: { orden: { id: string; orden: number }[] }) {
    return this.destinosService.reordenarGaleria(id, body.orden);
  }
}
