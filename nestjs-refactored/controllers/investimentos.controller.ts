import { Controller, Post, Body, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequisicaoComJwt } from '../jwt/jwt-payload.interface';
import { ObterProdutosInvestimentoDto } from '../dto/obter-produtos-investimento.dto';
import { InvestimentosService } from '../services/investimentos.service';

/**
 * Controller para operações de investimentos
 */
@ApiTags('Investimentos')
@ApiBearerAuth()
@Controller('api/v1/extratos/investimentos')
export class InvestimentosController {
  private readonly logger = new Logger(InvestimentosController.name);

  constructor(private readonly servicoInvestimentos: InvestimentosService) {}

  @Post('produtos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter produtos de investimento' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 403, description: 'Conta/Agência não pertence ao usuário' })
  async obterProdutos(@Body() dto: ObterProdutosInvestimentoDto, @Req() requisicao: RequisicaoComJwt) {
    const agencia = requisicao.agenciaDecodificada || this.decodificarBase64(dto.agencia) || dto.agencia;
    const conta = requisicao.contaDecodificada || this.decodificarBase64(dto.conta) || dto.conta;

    const resultado = await this.servicoInvestimentos.obterProdutosInvestimento({
      tipoInvestimento: dto.tipoInvestimento,
      agencia,
      conta,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
    });

    return { success: true, data: resultado };
  }

  private decodificarBase64(valor: string): string | undefined {
    try {
      let valorBase64 = valor.replace(/-/g, '+').replace(/_/g, '/');
      const padding = valorBase64.length % 4;
      if (padding) valorBase64 += '='.repeat(4 - padding);
      return Buffer.from(valorBase64, 'base64').toString('utf8');
    } catch {
      return undefined;
    }
  }
}
