import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.contrasena, 10);

    // Crear el usuario con la contraseña cifrada
    const user = await this.usersService.create({
      ...registerDto,
      contrasena: hashedPassword,
    });

    // Generar token JWT
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    // Retornar usuario sin contraseña y el token
    const { contrasena, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.contrasena, user.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    // Retornar usuario sin contraseña y el token
    const { contrasena, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async validateUser(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const { contrasena, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
