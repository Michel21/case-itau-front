import { ExtratoDados } from '../types/extrato.types';

/**
 * Dados mock para teste baseados no template padrão
 */
export const MOCK_EXTRATO_DATA: ExtratoDados = {
  empresa: '49.320.901 LUCIANO RAMOS | 49.320.901/0001-50',
  agencia: '1221 | 35394-9',
  dataBusca: 'Agosto/2025',
  tipoInvestimento: 'CDB - Certificado de Depósito Bancário',
  tipoProduto: 'Invest Facil Bradesco',
  
  saldoAnterior: {
    dataSaldo: '31/07/2025',
    itens: [
      {
        dataAplicacao: '10/03/2025',
        dataVencimento: '01/03/2027',
        dataResgate: null,
        taxa: null,
        valorPrincipal: 58.22,
        valorBruto: 58.37,
        rendaTotal: 0.15,
        iof: 0.00,
        irrf: 0.03,
        valorLiquido: 58.34,
        rendaBrutaPer: null
      },
      {
        dataAplicacao: '31/03/2025',
        dataVencimento: '22/03/2027',
        dataResgate: null,
        taxa: 5.00,
        valorPrincipal: 90.12,
        valorBruto: 90.32,
        rendaTotal: 0.20,
        iof: 0.00,
        irrf: 0.04,
        valorLiquido: null,
        rendaBrutaPer: null
      },
      {
        dataAplicacao: '23/05/2025',
        dataVencimento: '07/05/2024',
        dataResgate: null,
        taxa: null,
        valorPrincipal: 1005.40,
        valorBruto: 1005.48,
        rendaTotal: 0.08,
        iof: 0.00,
        irrf: 0.29,
        valorLiquido: 1005.11,
        rendaBrutaPer: null
      }
    ],
    totalValorPrincipal: 1153.74,
    totalValorBruto: 1154.17,
    totalRendaTotal: 0.43,
    totalIof: 0.00,
    totalIrrf: 0.36,
    totalValorLiquido: 1153.81,
    totalRendaBrutaPer: null
  },
  
  aplicacoes: {
    itens: [
      {
        dataAplicacao: '04/08/2025',
        dataVencimento: '26/07/2027',
        dataResgate: null,
        taxa: null,
        valorPrincipal: 850.00,
        valorBruto: 850.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 850.00,
        rendaBrutaPer: null
      },
      {
        dataAplicacao: '05/08/2025',
        dataVencimento: '05/08/2027',
        dataResgate: null,
        taxa: null,
        valorPrincipal: 100.00,
        valorBruto: 100.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 100.00,
        rendaBrutaPer: null
      }
    ],
    totalValorPrincipal: 950.00,
    totalValorBruto: 950.00,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.00,
    totalValorLiquido: 950.00,
    totalRendaBrutaPer: null
  },
  
  resgates: {
    itens: [
      {
        dataAplicacao: '10/03/2025',
        dataVencimento: '01/03/2027',
        dataResgate: '05/08/2025',
        taxa: 5.00,
        valorPrincipal: 58.22,
        valorBruto: 58.37,
        rendaTotal: 0.15,
        iof: 0.00,
        irrf: 0.03,
        valorLiquido: 58.34,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '23/05/2025',
        dataVencimento: '13/05/2027',
        dataResgate: '26/06/2025',
        taxa: 5.00,
        valorPrincipal: 844.81,
        valorBruto: 845.46,
        rendaTotal: 0.65,
        iof: 0.00,
        irrf: 0.14,
        valorLiquido: 845.32,
        rendaBrutaPer: 0.08
      },
      {
        dataAplicacao: '26/06/2025',
        dataVencimento: '16/06/2027',
        dataResgate: '30/06/2025',
        taxa: 5.00,
        valorPrincipal: 29.06,
        valorBruto: 29.08,
        rendaTotal: 0.02,
        iof: 0.00,
        irrf: 0.01,
        valorLiquido: 29.07,
        rendaBrutaPer: 0.01
      }
    ],
    totalValorPrincipal: 932.09,
    totalValorBruto: 932.91,
    totalRendaTotal: 0.82,
    totalIof: 0.00,
    totalIrrf: 0.18,
    totalValorLiquido: 932.73,
    totalRendaBrutaPer: 0.09
  },
  
  saldoFinal: {
    dataSaldo: '25/08/2025',
    itens: [
      {
        dataAplicacao: '28/08/2025',
        dataVencimento: '07/06/2027',
        dataResgate: null,
        taxa: 5.00,
        valorPrincipal: 44.56,
        valorBruto: 44.61,
        rendaTotal: 0.05,
        iof: 0.00,
        irrf: 0.01,
        valorLiquido: 44.60,
        rendaBrutaPer: 0.02
      }
    ],
    totalValorPrincipal: 194.56,
    totalValorBruto: 194.61,
    totalRendaTotal: 0.05,
    totalIof: 0.00,
    totalIrrf: 0.01,
    totalValorLiquido: 194.60,
    totalRendaBrutaPer: 0.02
  }
};
