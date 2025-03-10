import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { ensureEnvVar } from '../common/ensure.env';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: ensureEnvVar(process.env.JWT_SECRET, 'JWT_SECRET'),
      signOptions: {
        expiresIn: ensureEnvVar(process.env.JWT_EXPIRES_IN, 'JWT_EXPIRES_IN'),
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
