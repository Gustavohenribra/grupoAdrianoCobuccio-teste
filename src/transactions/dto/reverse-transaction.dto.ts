import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReverseTransactionDto {
  @ApiPropertyOptional({
    description: 'Motivo para a reversão da transação',
    example: 'Erro na transferência',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
