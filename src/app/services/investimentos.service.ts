import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface da resposta da API
 */
export interface RespostaApi<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Produto de investimento
 */
export interface ProdutoInvestimento {
  codigo: string;
  nome: string;
  tipo: string;
  saldoAtual: number;
  dataAplicacao: string;
  dataVencimento: string;
  rentabilidade: number;
  taxa: number;
  valorAplicado: number;
  valorAtual: number;
}

/**
 * Saldo de investimento
 */
export interface SaldoInvestimento {
  tipoInvestimento: string;
  saldoTotal: number;
  saldoDisponivel: number;
  saldoBloqueado: number;
  dataReferencia: string;
  produtos: ProdutoInvestimento[];
}

/**
 * Item de extrato
 */
export interface ItemExtratoInvestimento {
  data: string;
  tipoOperacao: string;
  descricao: string;
  valor: number;
  saldoAnterior: number;
  saldoAtual: number;
  codigoProduto: string;
  nomeProduto: string;
}

/**
 * Resposta paginada
 */
export interface RespostaPaginada<T> {
  dados: T[];
  paginacao: {
    paginaAtual: number;
    itensPorPagina: number;
    totalItens: number;
    totalPaginas: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}

/**
 * Posição consolidada
 */
export interface PosicaoConsolidadaInvestimento {
  dataReferencia: string;
  valorTotalAplicado: number;
  valorTotalAtual: number;
  rentabilidadeTotal: number;
  percentualRentabilidade: number;
  produtos: ProdutoInvestimento[];
  resumoPorTipo: Array<{
    tipo: string;
    quantidade: number;
    valorTotal: number;
  }>;
}

/**
 * Resposta de investir
 */
export interface InvestirResposta {
  numeroOperacao: string;
  status: string;
  mensagem: string;
}

/**
 * Serviço de investimentos integrado com a API JWT.
 * 
 * IMPORTANTE: Agência e conta NÃO devem ser enviadas nos payloads.
 * Esses dados são extraídos automaticamente do token JWT pela API.
 * 
 * Base URL: /v1/extratos/investimentos
 * Autenticação: Bearer token (incluso automaticamente pelo interceptor)
 */
@Injectable({
  providedIn: 'root'
})
export class InvestimentosService {
  private readonly baseUrl = `${environment.apiInvestimentos}/v1/extratos/investimentos`;

  constructor(private http: HttpClient) {}

  /**
   * Lista produtos de investimento.
   * Agência e conta vêm do token JWT.
   */
  obterProdutos(
    tipoInvestimento: string,
    dataInicio: string,
    dataFim: string
  ): Observable<RespostaApi<ProdutoInvestimento[]>> {
    return this.http.post<RespostaApi<ProdutoInvestimento[]>>(
      `${this.baseUrl}/produtos`,
      {
        tipoInvestimento,
        dataInicio,
        dataFim
        // NÃO enviar agencia/conta - vêm do token JWT
      }
    );
  }

  /**
   * Obtém saldo consolidado.
   * Agência e conta vêm do token JWT.
   */
  obterSaldo(
    tipoInvestimento: string,
    dataReferencia?: string
  ): Observable<RespostaApi<SaldoInvestimento>> {
    return this.http.post<RespostaApi<SaldoInvestimento>>(
      `${this.baseUrl}/saldo`,
      {
        tipoInvestimento,
        ...(dataReferencia && { dataReferencia })
        // NÃO enviar agencia/conta - vêm do token JWT
      }
    );
  }

  /**
   * Obtém extrato paginado.
   * Agência e conta vêm do token JWT.
   */
  obterExtrato(
    tipoInvestimento: string,
    dataInicio: string,
    dataFim: string,
    pagina: number = 1,
    itensPorPagina: number = 20
  ): Observable<RespostaApi<RespostaPaginada<ItemExtratoInvestimento>>> {
    return this.http.post<RespostaApi<RespostaPaginada<ItemExtratoInvestimento>>>(
      `${this.baseUrl}/extrato`,
      {
        tipoInvestimento,
        dataInicio,
        dataFim,
        pagina,
        itensPorPagina
        // NÃO enviar agencia/conta - vêm do token JWT
      }
    );
  }

  /**
   * Obtém posição consolidada.
   * Agência e conta vêm do token JWT.
   */
  obterPosicao(
    dataReferencia?: string,
    tipoInvestimento?: string
  ): Observable<RespostaApi<PosicaoConsolidadaInvestimento>> {
    const params: any = {};
    if (dataReferencia) params.dataReferencia = dataReferencia;
    if (tipoInvestimento) params.tipoInvestimento = tipoInvestimento;
    // NÃO enviar agencia/conta - vêm do token JWT

    return this.http.get<RespostaApi<PosicaoConsolidadaInvestimento>>(
      `${this.baseUrl}/posicao`,
      { params }
    );
  }

  /**
   * Processar investimento.
   * Agência e conta vêm do token JWT.
   * 
   * @param produtoId - Código do produto
   * @param valor - Valor em reais
   * @param origemRecurso - Origem dos recursos (ex: 'conta-corrente')
   * @param idempotencyKey - Chave de idempotência opcional (para retry seguro)
   */
  investir(
    produtoId: string,
    valor: number,
    origemRecurso: string,
    idempotencyKey?: string
  ): Observable<RespostaApi<InvestirResposta>> {
    const headers: any = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }

    return this.http.post<RespostaApi<InvestirResposta>>(
      `${this.baseUrl}/investir`,
      {
        produtoId,
        valor,
        origemRecurso
        // NÃO enviar agencia/conta - vêm do token JWT
      },
      { headers }
    );
  }
}
