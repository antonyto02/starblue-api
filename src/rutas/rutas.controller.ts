import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { RutasService } from './rutas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('rutas')
export class RutasController {
  constructor(private rutasService: RutasService) {}

  // Público — rutas activas
  @Get('activas')
  findActivas() {
    return this.rutasService.findActivas();
  }

  // Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutasService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  crear(@Body() body: any) {
    return this.rutasService.crear(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  actualizar(@Param('id') id: string, @Body() body: any) {
    return this.rutasService.actualizar(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/toggle')
  toggleActiva(@Param('id') id: string) {
    return this.rutasService.toggleActiva(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.rutasService.eliminar(id);
  }

  // Tarifas (read-only, for salida creation)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':rutaId/tarifas')
  findTarifas(@Param('rutaId') rutaId: string) {
    return this.rutasService.findTarifas(rutaId);
  }

  // Tarifas desde una parada origen (empleado + admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMISIONISTA, Role.ADMIN)
  @Get(':rutaId/tarifas/desde/:paradaOrigenId')
  findTarifasDesde(
    @Param('rutaId') rutaId: string,
    @Param('paradaOrigenId') paradaOrigenId: string,
  ) {
    return this.rutasService.findTarifasDesde(rutaId, paradaOrigenId);
  }
}
