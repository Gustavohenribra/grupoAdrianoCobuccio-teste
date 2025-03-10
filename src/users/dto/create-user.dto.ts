import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Gustavo Motta' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'gustavomotta@exemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
