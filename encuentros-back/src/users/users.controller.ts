import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() userData: any): Promise<User> {
    console.log('Received user data:', userData); // Log the received data
    return this.usersService.create(userData);
  }

  @Post('login')
  async login(@Body() body: { email: string; contrasena: string }) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }
    if (user.contrasena !== body.contrasena) {
      return { success: false, message: 'Contraseña incorrecta' };
    }
    return { success: true, user };
  }
}
