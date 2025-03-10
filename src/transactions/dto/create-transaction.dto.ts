import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 2, description: 'ID do usuário destinatário' })
  @IsNumber()
  receiverId: number;

  @ApiProperty({ example: 100.5, description: 'Valor da transferência' })
  @IsPositive()
  amount: number;
}
