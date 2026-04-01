import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservacion } from './reservacion.entity';
import { Salida } from '../salidas/salida.entity';
import { RutaParada } from '../rutas/ruta-parada.entity';
import { RutaTarifa } from '../rutas/ruta-tarifa.entity';
import { SalidaTarifa } from '../salidas/salida-tarifa.entity';
import { ReservacionesService } from './reservaciones.service';
import { ReservacionesController } from './reservaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reservacion, Salida, RutaParada, RutaTarifa, SalidaTarifa])],
  providers: [ReservacionesService],
  controllers: [ReservacionesController],
})
export class ReservacionesModule {}
