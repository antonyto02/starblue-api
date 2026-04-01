import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  // Público — el frontend lo necesita para mostrar precios MXN
  @Get()
  getAll() {
    return this.configService.getAll();
  }

  // Solo admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put()
  update(@Body() body: Record<string, string>) {
    return this.configService.updateMany(body);
  }
}
