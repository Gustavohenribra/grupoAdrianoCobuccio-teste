import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: 200.0, description: 'Valor a ser depositado' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
