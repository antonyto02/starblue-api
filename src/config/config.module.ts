import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from './config.entity';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion])],
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class AppConfigModule {}
