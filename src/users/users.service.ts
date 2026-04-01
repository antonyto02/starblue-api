import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(data: { email: string; password: string; name: string; role?: Role }) {
    const exists = await this.usersRepo.findOne({ where: { email: data.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const user = this.usersRepo.create({
      ...data,
      password: await bcrypt.hash(data.password, 10),
    });
    const saved = await this.usersRepo.save(user);
    const { password: _, ...result } = saved;
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  findEmpleados() {
    return this.usersRepo.find({
      where: { role: Role.COMISIONISTA },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'isActive', 'createdAt'],
    });
  }

  async toggleActive(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.usersRepo.update(id, { isActive: !user.isActive });
    return this.usersRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'isActive', 'createdAt'],
    });
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findById(id);
    await this.usersRepo.update(id, { password: await bcrypt.hash(newPassword, 10) });
    return { message: 'Contraseña actualizada' };
  }
}
