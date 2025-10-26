import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const toSave: Partial<User> = {
      nombre: data.nombre,
      apellido: data.apellido ?? undefined,
      email: data.email,
      contrasena: data.contrasena,
      imagenPerfil: data.imagenPerfil ?? undefined,
    };

    const newUser = this.usersRepository.create(toSave as any);

    return (await this.usersRepository.save(newUser)) as unknown as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async updateUser(email: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  async updatePassword(email: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    // Nota: actualmente las contraseñas se almacenan en texto plano en este proyecto.
    // Aquí validamos la contraseña actual y la sobrescribimos por la nueva.
    if (user.contrasena !== currentPassword) {
      throw new Error('Contraseña actual incorrecta');
    }
    user.contrasena = newPassword;
    const saved = await this.usersRepository.save(user);
    // No devolver la contraseña en la respuesta (caller puede filtrar)
    (saved as any).contrasena = undefined;
    return saved;
  }

  async deleteUser(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    await this.usersRepository.remove(user);
  }

  async searchByName(q: string): Promise<User[]> {
    const term = (q || '').trim().toLowerCase();
    if (!term) return [];
    // Buscar por nombre, apellido o email que contenga el término (case-insensitive)
    return await this.usersRepository
      .createQueryBuilder('u')
      .where('LOWER(u.nombre) LIKE :t', { t: `%${term}%` })
      .orWhere('LOWER(u.apellido) LIKE :t', { t: `%${term}%` })
      .orWhere('LOWER(u.email) LIKE :t', { t: `%${term}%` })
      .select(['u.id', 'u.nombre', 'u.apellido', 'u.email', 'u.imagenPerfil'])
      .getMany();
  }
}
