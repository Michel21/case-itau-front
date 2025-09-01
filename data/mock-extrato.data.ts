import { ExtratoDados } from '../types/extrato.types';

/**
 * Dados mock para teste baseados na imagem do extrato Bradesco Corporate
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
        dataAplicacao: '15/01/2025',
        dataVencimento: '15/01/2026',
        dataResgate: undefined,
        taxa: 13.75,
        valorPrincipal: 100000.00,
        valorBruto: 100000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 100000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '20/02/2025',
        dataVencimento: '20/02/2026',
        dataResgate: undefined,
        taxa: 13.50,
        valorPrincipal: 50000.00,
        valorBruto: 50000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 50000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '10/03/2025',
        dataVencimento: '10/03/2026',
        dataResgate: undefined,
        taxa: 13.25,
        valorPrincipal: 75000.00,
        valorBruto: 75000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 75000.00,
        rendaBrutaPer: 0.00
      }
    ],
    totalValorPrincipal: 225000.00,
    totalValorBruto: 225000.00,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.00,
    totalValorLiquido: 225000.00,
    totalRendaBrutaPer: 0.00
  },
  
  aplicacoes: {
    itens: [
      {
        dataAplicacao: '05/08/2025',
        dataVencimento: '05/08/2026',
        dataResgate: undefined,
        taxa: 13.00,
        valorPrincipal: 100000.00,
        valorBruto: 100000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 100000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '10/08/2025',
        dataVencimento: '10/08/2026',
        dataResgate: undefined,
        taxa: 12.75,
        valorPrincipal: 50000.00,
        valorBruto: 50000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 50000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '15/08/2025',
        dataVencimento: '15/08/2026',
        dataResgate: undefined,
        taxa: 12.50,
        valorPrincipal: 75000.00,
        valorBruto: 75000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 75000.00,
        rendaBrutaPer: 0.00
      }
    ],
    totalValorPrincipal: 225000.00,
    totalValorBruto: 225000.00,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.00,
    totalValorLiquido: 225000.00,
    totalRendaBrutaPer: 0.00
  },
  
  resgates: {
    itens: [
      {
        dataAplicacao: '15/01/2025',
        dataVencimento: '15/01/2026',
        dataResgate: '31/07/2025',
        taxa: 13.75,
        valorPrincipal: 100000.00,
        valorBruto: 100000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 100000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '20/02/2025',
        dataVencimento: '20/02/2026',
        dataResgate: '31/07/2025',
        taxa: 13.50,
        valorPrincipal: 50000.00,
        valorBruto: 50000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 50000.00,
        rendaBrutaPer: 0.00
      }
    ],
    totalValorPrincipal: 150000.00,
    totalValorBruto: 150000.00,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.00,
    totalValorLiquido: 150000.00,
    totalRendaBrutaPer: 0.00
  },
  
  saldoFinal: {
    dataSaldo: '25/08/2025',
    itens: [
      {
        dataAplicacao: '10/03/2025',
        dataVencimento: '10/03/2026',
        dataResgate: undefined,
        taxa: 13.25,
        valorPrincipal: 75000.00,
        valorBruto: 75000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 75000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '05/08/2025',
        dataVencimento: '05/08/2026',
        dataResgate: undefined,
        taxa: 13.00,
        valorPrincipal: 100000.00,
        valorBruto: 100000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 100000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '10/08/2025',
        dataVencimento: '10/08/2026',
        dataResgate: undefined,
        taxa: 12.75,
        valorPrincipal: 50000.00,
        valorBruto: 50000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 50000.00,
        rendaBrutaPer: 0.00
      },
      {
        dataAplicacao: '15/08/2025',
        dataVencimento: '15/08/2026',
        dataResgate: undefined,
        taxa: 12.50,
        valorPrincipal: 75000.00,
        valorBruto: 75000.00,
        rendaTotal: 0.00,
        iof: 0.00,
        irrf: 0.00,
        valorLiquido: 75000.00,
        rendaBrutaPer: 0.00
      }
    ],
    totalValorPrincipal: 300000.00,
    totalValorBruto: 300000.00,
    totalRendaTotal: 0.00,
    totalIof: 0.00,
    totalIrrf: 0.00,
    totalValorLiquido: 300000.00,
    totalRendaBrutaPer: 0.00
  }
};
