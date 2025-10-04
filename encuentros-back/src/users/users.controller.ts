import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('users') // Agrupa estos endpoints bajo "users" en Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Juan Pérez' },
        email: { type: 'string', example: 'juan@mail.com' },
        contrasena: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario creado con éxito', type: User })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() userData: any): Promise<User> {
    console.log('Received user data:', userData);
    return this.usersService.create(userData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de un usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'juan@mail.com' },
        contrasena: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
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
