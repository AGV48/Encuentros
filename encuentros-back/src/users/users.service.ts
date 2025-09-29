import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: any): Promise<User> {
    const newUser = this.usersRepository.create({
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      contrasena: data.contrasena,
      imagenPerfil: null, // ahora válido porque en la entidad es string | null
    });

    return await this.usersRepository.save(newUser) as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }
}
