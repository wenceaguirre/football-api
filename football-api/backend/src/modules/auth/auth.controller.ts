// src/modules/auth/auth.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';
import { Public } from './public.decorator';
import { UserService } from '../users/user.service';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService, private users: UserService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const user = await this.users.create(dto.email, dto.name, dto.password);
    // Romper el tipo del modelo → devolver tipos primitivos
    return {
      id: Number(user.id),
      email: user.email,
      name: user.name,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const u = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login({ id: u.id as unknown as number, email: u.email, name: u.name });
  }
}
