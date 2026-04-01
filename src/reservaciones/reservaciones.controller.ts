import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { EstadoReservacion } from './reservacion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private reservacionesService: ReservacionesService) {}

  // Público — reserva sin cuenta
  @Post()
  crear(@Body() body: any) {
    return this.reservacionesService.crear({ ...body, empleadoId: null });
  }

  // Público / Empleado — disponibilidad de asientos para un tramo
  @Get('disponibilidad/:salidaId')
  disponibilidad(
    @Param('salidaId') salidaId: string,
    @Query('origenId') origenId: string,
    @Query('destinoId') destinoId: string,
  ) {
    return this.reservacionesService.disponibilidadTramo(salidaId, origenId, destinoId);
  }

  // Empleado — reserva en nombre de un cliente (registra su id)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMISIONISTA, Role.ADMIN)
  @Post('empleado')
  crearComoEmpleado(@Body() body: any, @Request() req: any) {
    return this.reservacionesService.crear({ ...body, empleadoId: req.user.sub });
  }

  // Empleado — sus propias reservas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMISIONISTA, Role.ADMIN)
  @Get('mis-reservas')
  misReservas(@Request() req: any) {
    return this.reservacionesService.findByEmpleado(req.user.sub);
  }

  // Admin — stats de comisiones por empleado
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('empleados/stats')
  statsEmpleados() {
    return this.reservacionesService.statsEmpleados();
  }

  // Admin — pendientes count para insignia
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('pendientes/count')
  contarPendientes() {
    return this.reservacionesService.contarPendientes();
  }

  // Admin — todas las reservas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('estado') estado?: EstadoReservacion) {
    return this.reservacionesService.findAll(estado);
  }

  // Admin — confirmar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/confirmar')
  confirmar(@Param('id') id: string) {
    return this.reservacionesService.confirmar(id);
  }

  // Admin — cancelar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.reservacionesService.cancelar(id);
  }
}
