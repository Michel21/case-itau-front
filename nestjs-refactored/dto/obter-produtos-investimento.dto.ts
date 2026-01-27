import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para requisição de produtos de investimento
 */
export class ObterProdutosInvestimentoDto {
  @ApiProperty({ description: 'Tipo de investimento', example: '389' })
  @IsString()
  @IsNotEmpty()
  tipoInvestimento: string;

  @ApiProperty({ description: 'Agência (pode estar em Base64)', example: 'Mgo=' })
  @IsString()
  @IsNotEmpty()
  agencia: string;

  @ApiProperty({ description: 'Conta (pode estar em Base64)', example: 'OTMyNTMK' })
  @IsString()
  @IsNotEmpty()
  conta: string;

  @ApiProperty({ description: 'Data de início no formato MM/YYYY', example: '10/2024' })
  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataInicio deve estar no formato MM/YYYY' })
  dataInicio: string;

  @ApiProperty({ description: 'Data de fim no formato MM/YYYY', example: '10/2025' })
  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, { message: 'dataFim deve estar no formato MM/YYYY' })
  dataFim: string;
}
