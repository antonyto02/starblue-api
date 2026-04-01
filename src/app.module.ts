import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DestinosModule } from './destinos/destinos.module';
import { S3Module } from './s3/s3.module';
import { SalidasModule } from './salidas/salidas.module';
import { HomeModule } from './home/home.module';
import { ReservacionesModule } from './reservaciones/reservaciones.module';
import { RutasModule } from './rutas/rutas.module';
import { AppConfigModule } from './config/config.module';
import { Configuracion } from './config/config.entity';
import { User } from './users/user.entity';
import { Destino } from './destinos/destino.entity';
import { ImagenDestino } from './destinos/imagen-destino.entity';
import { Salida } from './salidas/salida.entity';
import { Ruta } from './rutas/ruta.entity';
import { RutaParada } from './rutas/ruta-parada.entity';
import { RutaTarifa } from './rutas/ruta-tarifa.entity';
import { SeccionHome } from './home/seccion-home.entity';
import { SeccionDestino } from './home/seccion-destino.entity';
import { Reservacion } from './reservaciones/reservacion.entity';
import { SalidaTarifa } from './salidas/salida-tarifa.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User, Destino, ImagenDestino,
        Ruta, RutaParada, RutaTarifa,
        Salida, SalidaTarifa, SeccionHome, SeccionDestino, Reservacion, Configuracion,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    DestinosModule,
    SalidasModule,
    RutasModule,
    HomeModule,
    ReservacionesModule,
    S3Module,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
