import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destino } from './destino.entity';
import { ImagenDestino } from './imagen-destino.entity';
import { DestinosService } from './destinos.service';
import { DestinosController } from './destinos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Destino, ImagenDestino])],
  providers: [DestinosService],
  controllers: [DestinosController],
})
export class DestinosModule {}
