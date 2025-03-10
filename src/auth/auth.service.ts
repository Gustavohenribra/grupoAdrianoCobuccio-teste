import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }

  async login(user: User): Promise<{ access_token: string }> {
    const payload = { id: user.id, email: user.email };

    try {
      const access_token = await this.jwtService.signAsync(payload);

      return { access_token };
    } catch (error) {
      console.error('Erro ao gerar token JWT:', error);
      throw new Error('Falha ao gerar o token de autenticação');
    }
  }
}
