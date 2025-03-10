import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    usersService = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      }),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should validate user and return token on login', async () => {
    const user = await authService.validateUser(
      'test@example.com',
      'password123',
    );
    expect(user).toBeDefined();
    const result = await authService.login(user);
    expect(result).toHaveProperty('access_token', 'signed-token');
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(
      authService.validateUser('invalid@example.com', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
