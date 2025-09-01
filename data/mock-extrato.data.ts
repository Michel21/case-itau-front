import { ExtratoDados } from '../types/extrato.types';

/**
 * Dados mock para teste baseados no modelo JSON fornecido
 */
export const MOCK_EXTRATO_DATA: ExtratoDados = {
  empresa: '49.320.901 LUCIANO RAMOS | 49.320.901/0001-50',
  agencia: '1221 | 35394-9',
  dataBusca: 'Agosto/2025',
  tipoInvestimento: 'CDB - Certificado de Depósito Bancário',
  tipoProduto: 'Invest Facil Bradesco',
  
  saldoAnterior: {
    dataSaldo: '25/08/2025',
    itens: [
      {
        dataAplicacao: '28/08/2025',
        dataVencimento: '07/06/2027',
        dataResgate: undefined,
        taxa: 5.00,
        valorPrincipal: 194.56,
        valorBruto: 194.61,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.01,
        valorLiquido: 194.60,
        rendaBrutaPer: 0.02,
        rendaBruta: 0.02
      }
    ],
    totalValorPrincipal: 194.56,
    totalValorBruto: 194.61,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.01,
    totalValorLiquido: 194.60,
    totalRendaBrutaPer: 0.02
  },
  
  aplicacoes: {
    itens: [
      {
        dataAplicacao: '28/08/2025',
        dataVencimento: '07/06/2027',
        dataResgate: undefined,
        taxa: 5.00,
        valorPrincipal: 194.56,
        valorBruto: 194.61,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.01,
        valorLiquido: 194.60,
        rendaBrutaPer: 0.02,
        rendaBruta: 0.02
      }
    ],
    totalValorPrincipal: 194.56,
    totalValorBruto: 194.61,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.01,
    totalValorLiquido: 194.60,
    totalRendaBrutaPer: 0.02
  },
  
  resgates: {
    itens: [
      {
        dataAplicacao: '28/08/2025',
        dataVencimento: '07/06/2027',
        dataResgate: '07/06/2027',
        taxa: 5.00,
        valorPrincipal: 194.56,
        valorBruto: 194.61,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.01,
        valorLiquido: 194.60,
        rendaBrutaPer: 0.02,
        rendaBruta: 0.02
      }
    ],
    totalValorPrincipal: 194.56,
    totalValorBruto: 194.61,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.01,
    totalValorLiquido: 194.60,
    totalRendaBrutaPer: 0.02
  },
  
  saldoFinal: {
    dataSaldo: '25/08/2025',
    itens: [
      {
        dataAplicacao: '28/08/2025',
        dataVencimento: '07/06/2027',
        dataResgate: undefined,
        taxa: 5.00,
        valorPrincipal: 194.56,
        valorBruto: 194.61,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.01,
        valorLiquido: 194.60,
        rendaBrutaPer: 0.02,
        rendaBruta: 0.02
      }
    ],
    totalValorPrincipal: 194.56,
    totalValorBruto: 194.61,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.01,
    totalValorLiquido: 194.60,
    totalRendaBrutaPer: 0.02
  }
};

// Estrutura adicional baseada no modelo JSON fornecido
export const RENDA_FIXA_DATA = {
  rendaFixa: {
    saldoFinal: [
      {
        taxa: 5.00,
        iof: 0.00,
        rendaTotal: 0.00,
        valoLiquido: 194.60,
        valorBruto: 194.61,
        dataVencimento: "07/06/2027",
        dataAplicacao: "28/08/2025",
        rendaBruta: 0.02,
        irrf: 0.01,
      }
    ],
    aplicacaoTotal: {
      valorPrincipal: 194.56
    },
    saldoAnterior: [
      {
        taxa: 5.00,
        iof: 0.00,
        rendaTotal: 0.00,
        valoLiquido: 194.60,
        valorBruto: 194.61,
        dataVencimento: "07/06/2027",
        dataAplicacao: "28/08/2025",
        rendaBruta: 0.02,
        irrf: 0.01,
      }
    ],
    saldoFinalTotal: {
      iof: 0.00,
      rendaTotal: 0.00,
      valoLiquido: 194.60,
      valorBruto: 194.61,
      rendaBruta: 0.02,
      valorPrincipal: 194.56,
      irrf: 0.01,
    },
    dataSaldoFinal: "25/08/2025",
    aplicacao: [
      {
        taxa: 5.00,
        dataVencimento: "07/06/2027",
        dataAplicacao: "28/08/2025",
        valorPrincipal: 194.56,
      }
    ],
    resgateTotal: {
      iof: 0.00,
      rendaTotal: 0.00,
      valoLiquido: 194.60,
      valorBruto: 194.61,
      rendaBruta: 0.02,
      valorPrincipal: 194.56,
      irrf: 0.01,
    },
    saldoAteriorTotal: {
      iof: 0.00,
      rendaTotal: 0.00,
      valoLiquido: 194.60,
      valorBruto: 194.61,
      rendaBruta: 0.02,
      valorPrincipal: 194.56,
      irrf: 0.01,
    },
    dataSaldoAnterior: "25/08/2025",
    resgate: [
      {
        taxa: 5.00,
        iof: 0.00,
        rendaTotal: 0.00,
        valoLiquido: 194.60,
        datasResgate: "07/06/2027",
        valorBruto: 194.61,
        dataVencimento: "07/06/2027",
        dataAplicacao: "28/08/2025",
        rendaBruta: 0.02,
        valorPrincipal: 194.56,
        irrf: 0.01,
      }
    ]
  }
};