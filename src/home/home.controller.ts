import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  // Público
  @Get('layout')
  getLayout() {
    return this.homeService.getLayout();
  }

  // Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('secciones')
  getAll() {
    return this.homeService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('secciones')
  create(@Body() body: { titulo: string; tipo?: any }) {
    return this.homeService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('secciones/orden')
  reordenarSecciones(@Body() body: { orden: { id: string; orden: number }[] }) {
    return this.homeService.reordenarSecciones(body.orden);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('secciones/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.homeService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('secciones/:id')
  remove(@Param('id') id: string) {
    return this.homeService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('secciones/:id/destinos')
  addDestino(@Param('id') id: string, @Body() body: { destinoId: string }) {
    return this.homeService.addDestino(id, body.destinoId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('secciones/:id/destinos/:destinoId')
  removeDestino(@Param('id') id: string, @Param('destinoId') destinoId: string) {
    return this.homeService.removeDestino(id, destinoId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('secciones/:id/destinos/orden')
  reordenarDestinos(@Param('id') id: string, @Body() body: { orden: { id: string; orden: number }[] }) {
    return this.homeService.reordenarDestinos(id, body.orden);
  }
}
