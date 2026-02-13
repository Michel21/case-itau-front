import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para requisição de produtos de investimento
 */
export class ObterProdutosInvestimentoDto {
  @ApiProperty({ description: 'Tipo de investimento', example: '389' })
  @IsString()
  @IsNotEmpty()
  tipoInvestimento: string;

  @ApiPropertyOptional({ description: 'Agência (opcional se já estiver no JWT ou header x-pdpj-conta)', example: 'Mgo=' })
  @IsString()
  @IsOptional()
  agencia?: string;

  @ApiPropertyOptional({ description: 'Conta (opcional se já estiver no JWT ou header x-pdpj-conta)', example: 'OTMyNTMK' })
  @IsString()
  @IsOptional()
  conta?: string;

  @ApiProperty({ description: 'Data de início no formato MM/YYYY', example: '10/2024' })
  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataInicio deve estar no formato MM/YYYY' })
  dataInicio: string;

  @ApiProperty({ description: 'Data de fim no formato MM/YYYY', example: '10/2025' })
  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataFim deve estar no formato MM/YYYY' })
  dataFim: string;
}
