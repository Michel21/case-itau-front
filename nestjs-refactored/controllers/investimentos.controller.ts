import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequisicaoComJwt } from '../jwt/jwt-payload.interface';
import { ObterProdutosInvestimentoDto } from '../dto/obter-produtos-investimento.dto';
import { ObterSaldoInvestimentoDto } from '../dto/obter-saldo-investimento.dto';
import { ObterExtratoInvestimentoDto } from '../dto/obter-extrato-investimento.dto';
import { ObterPosicaoInvestimentoDto } from '../dto/obter-posicao-investimento.dto';
import { InvestimentosService } from '../services/investimentos.service';
import { RespostaApi } from '../interfaces/investimentos.interface';

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
  @ApiResponse({ status: 401, description: 'Token não fornecido ou inválido' })
  @ApiResponse({ status: 403, description: 'Conta/Agência não pertence ao usuário' })
  async obterProdutos(@Body() dto: ObterProdutosInvestimentoDto, @Req() requisicao: RequisicaoComJwt): Promise<RespostaApi<any>> {
    const { agencia, conta } = this.extrairAgenciaConta(dto, requisicao);

    const resultado = await this.servicoInvestimentos.obterProdutosInvestimento({
      tipoInvestimento: dto.tipoInvestimento,
      agencia,
      conta,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
    });

    return {
      success: true,
      data: resultado,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('saldo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter saldo consolidado de investimentos' })
  @ApiResponse({ status: 200, description: 'Saldo retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token não fornecido ou inválido' })
  @ApiResponse({ status: 403, description: 'Conta/Agência não pertence ao usuário' })
  async obterSaldo(@Body() dto: ObterSaldoInvestimentoDto, @Req() requisicao: RequisicaoComJwt): Promise<RespostaApi<any>> {
    const { agencia, conta } = this.extrairAgenciaConta(dto, requisicao);

    const resultado = await this.servicoInvestimentos.obterSaldoInvestimento({
      tipoInvestimento: dto.tipoInvestimento,
      agencia,
      conta,
      dataReferencia: dto.dataReferencia,
    });

    return {
      success: true,
      data: resultado,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('extrato')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter extrato de movimentações de investimentos' })
  @ApiResponse({ status: 200, description: 'Extrato retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token não fornecido ou inválido' })
  @ApiResponse({ status: 403, description: 'Conta/Agência não pertence ao usuário' })
  async obterExtrato(@Body() dto: ObterExtratoInvestimentoDto, @Req() requisicao: RequisicaoComJwt): Promise<RespostaApi<any>> {
    const { agencia, conta } = this.extrairAgenciaConta(dto, requisicao);

    const resultado = await this.servicoInvestimentos.obterExtratoInvestimento({
      tipoInvestimento: dto.tipoInvestimento,
      agencia,
      conta,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
      pagina: dto.pagina,
      itensPorPagina: dto.itensPorPagina,
    });

    return {
      success: true,
      data: resultado,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('posicao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter posição consolidada de investimentos' })
  @ApiResponse({ status: 200, description: 'Posição consolidada retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token não fornecido ou inválido' })
  @ApiResponse({ status: 403, description: 'Conta/Agência não pertence ao usuário' })
  async obterPosicao(@Body() dto: ObterPosicaoInvestimentoDto, @Req() requisicao: RequisicaoComJwt): Promise<RespostaApi<any>> {
    const { agencia, conta } = this.extrairAgenciaConta(dto, requisicao);

    const resultado = await this.servicoInvestimentos.obterPosicaoInvestimento({
      agencia,
      conta,
      dataReferencia: dto.dataReferencia,
      tipoInvestimento: dto.tipoInvestimento,
    });

    return {
      success: true,
      data: resultado,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extrai agência e conta do DTO ou da requisição (JWT/header)
   */
  private extrairAgenciaConta(dto: { agencia?: string; conta?: string }, requisicao: RequisicaoComJwt): { agencia: string; conta: string } {
    // Prioridade: header x-pdpj-conta > JWT > DTO
    const contaHeader = (requisicao.headers as any)['x-pdpj-conta'];
    let agencia: string | undefined;
    let conta: string | undefined;

    if (contaHeader) {
      const partes = contaHeader.split('-');
      if (partes.length >= 2) {
        agencia = partes[0];
        conta = partes[1];
      }
    }

    // Se não encontrou no header, tenta do JWT
    if (!agencia || !conta) {
      agencia = requisicao.agenciaDecodificada;
      conta = requisicao.contaDecodificada;
    }

    // Se ainda não encontrou, tenta do DTO (pode estar em base64)
    if (!agencia && dto.agencia) {
      agencia = this.decodificarBase64(dto.agencia) || dto.agencia;
    }

    if (!conta && dto.conta) {
      conta = this.decodificarBase64(dto.conta) || dto.conta;
    }

    if (!agencia || !conta) {
      throw new BadRequestException('Agência e conta são obrigatórias. Forneça via header x-pdpj-conta, JWT ou no corpo da requisição.');
    }

    return { agencia, conta };
  }

  /**
   * Decodifica valor em base64
   */
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
