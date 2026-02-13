import { IsString, IsNotEmpty, IsOptional, Matches, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para requisição de extrato de investimentos
 */
export class ObterExtratoInvestimentoDto {
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

  @ApiProperty({ description: 'Data de início no formato MM/YYYY', example: '10/2024' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataInicio deve estar no formato MM/YYYY' })
  dataInicio: string;

  @ApiProperty({ description: 'Data de fim no formato MM/YYYY', example: '10/2025' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataFim deve estar no formato MM/YYYY' })
  dataFim: string;

  @ApiPropertyOptional({ description: 'Número da página (padrão: 1)', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pagina?: number;

  @ApiPropertyOptional({ description: 'Itens por página (padrão: 20, máximo: 100)', example: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  itensPorPagina?: number;
}
