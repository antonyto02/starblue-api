import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SalidasService } from './salidas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('salidas')
export class SalidasController {
  constructor(private salidasService: SalidasService) {}

  // Público
  @Get('proximas')
  findProximas() {
    return this.salidasService.findProximas();
  }

  @Get('ruta/:rutaId/proximas')
  findProximasByRuta(@Param('rutaId') rutaId: string) {
    return this.salidasService.findProximasByRuta(rutaId);
  }

  // Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.salidasService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('ruta/:rutaId')
  findByRuta(@Param('rutaId') rutaId: string) {
    return this.salidasService.findByRuta(rutaId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salidasService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.salidasService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('generar')
  generarSalidas(@Body() body: any) {
    return this.salidasService.generarSalidas(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.salidasService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salidasService.remove(id);
  }

  /* ─── Tarifas por salida (Admin) ─── */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id/tarifas')
  getTarifas(@Param('id') id: string) {
    return this.salidasService.getTarifas(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/tarifas')
  createTarifa(@Param('id') id: string, @Body() body: any) {
    return this.salidasService.createTarifa(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/tarifas/:tarifaId')
  updateTarifa(
    @Param('id') id: string,
    @Param('tarifaId') tarifaId: string,
    @Body() body: any,
  ) {
    return this.salidasService.updateTarifa(id, tarifaId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/tarifas/:tarifaId')
  deleteTarifa(
    @Param('id') id: string,
    @Param('tarifaId') tarifaId: string,
  ) {
    return this.salidasService.deleteTarifa(id, tarifaId);
  }
}
