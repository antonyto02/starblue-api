import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { Role } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    await usersService.create({
      email: 'admin@starblue.com',
      password: 'admin123',
      name: 'Administrador',
      role: Role.ADMIN,
    });
    console.log('✅ Admin creado: admin@starblue.com / admin123');
  } catch (e: any) {
    if (e.status === 409) {
      console.log('ℹ️  El admin ya existe');
    } else {
      console.error('❌ Error:', e.message);
    }
  }

  await app.close();
}

bootstrap();
