import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salida } from './salida.entity';
import { SalidaTarifa } from './salida-tarifa.entity';
import { RutaTarifa } from '../rutas/ruta-tarifa.entity';
import { Ruta } from '../rutas/ruta.entity';
import { SalidasService } from './salidas.service';
import { SalidasController } from './salidas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Salida, SalidaTarifa, RutaTarifa, Ruta])],
  providers: [SalidasService],
  controllers: [SalidasController],
  exports: [SalidasService, TypeOrmModule],
})
export class SalidasModule {}


