/**
 * Interfaces para o sistema de extrato bancário
 */

export interface ExtratoItem {
  dataAplicacao: string;
  dataVencimento: string;
  dataResgate?: string;
  taxa?: number;
  valorPrincipal?: number;
  valorBruto?: number;
  rendaTotal?: number;
  iof?: number;
  irrf?: number;
  valorLiquido?: number;
  rendaBrutaPer?: number;
  rendaBruta?: number;
}

export interface ExtratoTotais {
  valorPrincipal?: number;
  valorBruto?: number;
  rendaTotal?: number;
  iof?: number;
  irrf?: number;
  valorLiquido?: number;
  rendaBrutaPer?: number;
}

export interface ExtratoSecao {
  dataSaldo?: string;
  itens: ExtratoItem[];
  totalValorPrincipal?: number;
  totalValorBruto?: number;
  totalRendaTotal?: number;
  totalIof?: number;
  totalIrrf?: number;
  totalValorLiquido?: number;
  totalRendaBrutaPer?: number;
}

export interface ExtratoDados {
  empresa: string;
  agencia: string;
  dataBusca: string;
  tipoInvestimento: string;
  tipoProduto: string;
  saldoAnterior?: ExtratoSecao;
  aplicacoes?: ExtratoSecao;
  resgates?: ExtratoSecao;
  saldoFinal?: ExtratoSecao;
}

export interface ExtratoConfig {
  titulo: string;
  dataTransacao: string;
  numeroControle: string;
  empresa: string;
  agencia: string;
  dataBusca: string;
  tipoInvestimento: string;
  tipoProduto: string;
}

export type ExtratoSecaoTipo = 'saldoAnterior' | 'aplicacoes' | 'resgates' | 'saldoFinal';

export interface ExtratoExportOptions {
  formato: 'pdf' | 'csv' | 'html';
  nomeArquivo?: string;
  incluirCabecalho?: boolean;
  incluirRodape?: boolean;
}

// Novos tipos baseados na estrutura RENDA_FIXA_DATA
export interface RendaFixaItem {
  taxa: number;
  dataVencimento: string;
  dataAplicacao: string;
  valorPrincipal?: number;
  valorBruto?: number;
  rendaTotal?: number;
  iof?: number;
  irrf?: number;
  valorLiquido?: number;
  rendaBruta?: number;
  datasResgate?: string;
}

export interface RendaFixaTotal {
  valorPrincipal?: number;
  valorBruto?: number;
  rendaTotal?: number;
  iof?: number;
  irrf?: number;
  valorLiquido?: number;
  rendaBruta?: number;
}

export interface RendaFixaData {
  rendaFixa: {
    saldoFinal: RendaFixaItem[];
    aplicacaoTotal: RendaFixaTotal;
    saldoAnterior: RendaFixaItem[];
    saldoFinalTotal: RendaFixaTotal;
    dataSaldoFinal: string;
    aplicacao: RendaFixaItem[];
    resgateTotal: RendaFixaTotal;
    saldoAteriorTotal: RendaFixaTotal;
    dataSaldoAnterior: string;
    resgate: RendaFixaItem[];
  };
}
