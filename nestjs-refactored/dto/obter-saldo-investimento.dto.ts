import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para requisição de saldo de investimentos
 */
export class ObterSaldoInvestimentoDto {
  @ApiProperty({ description: 'Tipo de investimento', example: '389' })
  @IsString()
  @IsNotEmpty()
  tipoInvestimento: string;

  @ApiPropertyOptional({ description: 'Agência (opcional se já estiver no JWT)', example: 'Mgo=' })
  @IsString()
  @IsOptional()
  agencia?: string;

  @ApiPropertyOptional({ description: 'Conta (opcional se já estiver no JWT)', example: 'OTMyNTMK' })
  @IsString()
  @IsOptional()
  conta?: string;

  @ApiPropertyOptional({ description: 'Data de referência no formato MM/YYYY', example: '10/2024' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataReferencia deve estar no formato MM/YYYY' })
  dataReferencia?: string;
}
