import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ensureEnvVar } from './common/ensure.env';
import { RateLimiterModule } from 'nestjs-rate-limiter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          };
        }
        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(ensureEnvVar(process.env.DB_PORT, 'DB_PORT')),
          username: ensureEnvVar(process.env.DB_USERNAME, 'DB_USERNAME'),
          password: ensureEnvVar(process.env.DB_PASSWORD, 'DB_PASSWORD'),
          database: ensureEnvVar(process.env.DB_DATABASE, 'DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    RateLimiterModule.register({
      points: 15,
      duration: 60,
    }),
    UsersModule,
    AuthModule,
    TransactionsModule,
  ],
})
export class AppModule {}
