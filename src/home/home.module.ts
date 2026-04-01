import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionHome } from './seccion-home.entity';
import { SeccionDestino } from './seccion-destino.entity';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SeccionHome, SeccionDestino])],
  providers: [HomeService],
  controllers: [HomeController],
})
export class HomeModule {}
