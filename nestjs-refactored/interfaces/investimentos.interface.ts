/**
 * Interface para produto de investimento
 */
export interface ProdutoInvestimento {
  codigo: string;
  nome: string;
  tipo: string;
  saldoAtual: number;
  dataAplicacao: string;
  dataVencimento?: string;
  rentabilidade: number;
  taxa: number;
  valorAplicado: number;
  valorAtual: number;
}

/**
 * Interface para saldo de investimento
 */
export interface SaldoInvestimento {
  tipoInvestimento: string;
  agencia: string;
  conta: string;
  saldoTotal: number;
  saldoDisponivel: number;
  saldoBloqueado: number;
  dataReferencia: string;
  produtos: ProdutoInvestimento[];
}

/**
 * Interface para item de extrato
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
 * Interface para resposta paginada
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
 * Interface para posição consolidada
 */
export interface PosicaoConsolidadaInvestimento {
  agencia: string;
  conta: string;
  dataReferencia: string;
  valorTotalAplicado: number;
  valorTotalAtual: number;
  rentabilidadeTotal: number;
  percentualRentabilidade: number;
  produtos: ProdutoInvestimento[];
  resumoPorTipo: {
    tipo: string;
    quantidade: number;
    valorTotal: number;
  }[];
}

/**
 * Interface para resposta padrão da API
 */
export interface RespostaApi<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
