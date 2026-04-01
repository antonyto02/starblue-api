import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from './ruta.entity';
import { RutaParada } from './ruta-parada.entity';
import { RutaTarifa } from './ruta-tarifa.entity';
import { Destino } from '../destinos/destino.entity';
import { RutasService } from './rutas.service';
import { RutasController } from './rutas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta, RutaParada, RutaTarifa, Destino])],
  providers: [RutasService],
  controllers: [RutasController],
  exports: [RutasService],
})
export class RutasModule {}
