import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ProdutoInvestimento,
  SaldoInvestimento,
  ItemExtratoInvestimento,
  RespostaPaginada,
  PosicaoConsolidadaInvestimento,
} from '../interfaces/investimentos.interface';

export interface ParametrosObterProdutosInvestimento {
  tipoInvestimento: string;
  agencia: string;
  conta: string;
  dataInicio: string;
  dataFim: string;
}

export interface ParametrosObterSaldoInvestimento {
  tipoInvestimento: string;
  agencia: string;
  conta: string;
  dataReferencia?: string;
}

export interface ParametrosObterExtratoInvestimento {
  tipoInvestimento: string;
  agencia: string;
  conta: string;
  dataInicio: string;
  dataFim: string;
  pagina?: number;
  itensPorPagina?: number;
}

export interface ParametrosObterPosicaoInvestimento {
  agencia: string;
  conta: string;
  dataReferencia?: string;
  tipoInvestimento?: string;
}

/**
 * Serviço para operações de investimentos
 */
@Injectable()
export class InvestimentosService {
  private readonly logger = new Logger(InvestimentosService.name);

  /**
   * Obtém produtos de investimento para um período específico
   */
  async obterProdutosInvestimento(parametros: ParametrosObterProdutosInvestimento): Promise<ProdutoInvestimento[]> {
    this.logger.log(
      `Buscando produtos: tipo=${parametros.tipoInvestimento}, ` +
        `agencia=${parametros.agencia}, conta=${parametros.conta}, ` +
        `periodo=${parametros.dataInicio} a ${parametros.dataFim}`,
    );

    this.validarPeriodo(parametros.dataInicio, parametros.dataFim);
    this.validarAgenciaConta(parametros.agencia, parametros.conta);

    // TODO: Implementar integração com serviço externo ou banco de dados
    // Por enquanto retorna dados mockados para desenvolvimento
    return this.obterProdutosMock(parametros);
  }

  /**
   * Obtém saldo consolidado de investimentos
   */
  async obterSaldoInvestimento(parametros: ParametrosObterSaldoInvestimento): Promise<SaldoInvestimento> {
    this.logger.log(
      `Buscando saldo: tipo=${parametros.tipoInvestimento}, ` +
        `agencia=${parametros.agencia}, conta=${parametros.conta}, ` +
        `dataReferencia=${parametros.dataReferencia || 'atual'}`,
    );

    this.validarAgenciaConta(parametros.agencia, parametros.conta);

    // TODO: Implementar integração com serviço externo ou banco de dados
    return this.obterSaldoMock(parametros);
  }

  /**
   * Obtém extrato de movimentações de investimentos
   */
  async obterExtratoInvestimento(
    parametros: ParametrosObterExtratoInvestimento,
  ): Promise<RespostaPaginada<ItemExtratoInvestimento>> {
    this.logger.log(
      `Buscando extrato: tipo=${parametros.tipoInvestimento}, ` +
        `agencia=${parametros.agencia}, conta=${parametros.conta}, ` +
        `periodo=${parametros.dataInicio} a ${parametros.dataFim}, ` +
        `pagina=${parametros.pagina || 1}`,
    );

    this.validarPeriodo(parametros.dataInicio, parametros.dataFim);
    this.validarAgenciaConta(parametros.agencia, parametros.conta);

    const pagina = parametros.pagina || 1;
    const itensPorPagina = Math.min(parametros.itensPorPagina || 20, 100);

    // TODO: Implementar integração com serviço externo ou banco de dados
    const todosItens = this.obterExtratoMock(parametros);
    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const dados = todosItens.slice(inicio, fim);
    const totalItens = todosItens.length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);

    return {
      dados,
      paginacao: {
        paginaAtual: pagina,
        itensPorPagina,
        totalItens,
        totalPaginas,
        temProximaPagina: pagina < totalPaginas,
        temPaginaAnterior: pagina > 1,
      },
    };
  }

  /**
   * Obtém posição consolidada de todos os investimentos
   */
  async obterPosicaoInvestimento(parametros: ParametrosObterPosicaoInvestimento): Promise<PosicaoConsolidadaInvestimento> {
    this.logger.log(
      `Buscando posição consolidada: agencia=${parametros.agencia}, ` +
        `conta=${parametros.conta}, ` +
        `dataReferencia=${parametros.dataReferencia || 'atual'}, ` +
        `tipo=${parametros.tipoInvestimento || 'todos'}`,
    );

    this.validarAgenciaConta(parametros.agencia, parametros.conta);

    // TODO: Implementar integração com serviço externo ou banco de dados
    return this.obterPosicaoMock(parametros);
  }

  /**
   * Valida período de datas
   */
  private validarPeriodo(dataInicio: string, dataFim: string): void {
    const [mesInicio, anoInicio] = dataInicio.split('/').map(Number);
    const [mesFim, anoFim] = dataFim.split('/').map(Number);

    const dataInicioObj = new Date(anoInicio, mesInicio - 1);
    const dataFimObj = new Date(anoFim, mesFim - 1);

    if (dataInicioObj > dataFimObj) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    const mesesDiferenca = (anoFim - anoInicio) * 12 + (mesFim - mesInicio);
    if (mesesDiferenca > 12) {
      throw new BadRequestException('Período máximo permitido é de 12 meses');
    }
  }

  /**
   * Valida agência e conta
   */
  private validarAgenciaConta(agencia: string, conta: string): void {
    if (!agencia || !conta) {
      throw new BadRequestException('Agência e conta são obrigatórias');
    }
  }

  /**
   * Dados mockados para desenvolvimento - REMOVER em produção
   */
  private obterProdutosMock(parametros: ParametrosObterProdutosInvestimento): ProdutoInvestimento[] {
    return [
      {
        codigo: '389',
        nome: 'CDB Pré-fixado',
        tipo: parametros.tipoInvestimento,
        saldoAtual: 50000.0,
        dataAplicacao: '01/2024',
        dataVencimento: '01/2025',
        rentabilidade: 12.5,
        taxa: 12.5,
        valorAplicado: 50000.0,
        valorAtual: 56250.0,
      },
      {
        codigo: '390',
        nome: 'LCI',
        tipo: parametros.tipoInvestimento,
        saldoAtual: 30000.0,
        dataAplicacao: '05/2024',
        dataVencimento: '05/2025',
        rentabilidade: 10.0,
        taxa: 10.0,
        valorAplicado: 30000.0,
        valorAtual: 33000.0,
      },
    ];
  }

  private obterSaldoMock(parametros: ParametrosObterSaldoInvestimento): SaldoInvestimento {
    const produtos = this.obterProdutosMock({
      tipoInvestimento: parametros.tipoInvestimento,
      agencia: parametros.agencia,
      conta: parametros.conta,
      dataInicio: '01/2024',
      dataFim: '12/2024',
    });

    return {
      tipoInvestimento: parametros.tipoInvestimento,
      agencia: parametros.agencia,
      conta: parametros.conta,
      saldoTotal: produtos.reduce((acc, p) => acc + p.valorAtual, 0),
      saldoDisponivel: produtos.reduce((acc, p) => acc + p.valorAtual, 0),
      saldoBloqueado: 0,
      dataReferencia: parametros.dataReferencia || new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
      produtos,
    };
  }

  private obterExtratoMock(parametros: ParametrosObterExtratoInvestimento): ItemExtratoInvestimento[] {
    return [
      {
        data: '15/10/2024',
        tipoOperacao: 'APLICACAO',
        descricao: 'Aplicação em CDB Pré-fixado',
        valor: 50000.0,
        saldoAnterior: 0,
        saldoAtual: 50000.0,
        codigoProduto: '389',
        nomeProduto: 'CDB Pré-fixado',
      },
      {
        data: '20/10/2024',
        tipoOperacao: 'RENDIMENTO',
        descricao: 'Rendimento mensal',
        valor: 520.83,
        saldoAnterior: 50000.0,
        saldoAtual: 50520.83,
        codigoProduto: '389',
        nomeProduto: 'CDB Pré-fixado',
      },
      {
        data: '25/10/2024',
        tipoOperacao: 'APLICACAO',
        descricao: 'Aplicação em LCI',
        valor: 30000.0,
        saldoAnterior: 50520.83,
        saldoAtual: 80520.83,
        codigoProduto: '390',
        nomeProduto: 'LCI',
      },
    ];
  }

  private obterPosicaoMock(parametros: ParametrosObterPosicaoInvestimento): PosicaoConsolidadaInvestimento {
    const produtos = this.obterProdutosMock({
      tipoInvestimento: parametros.tipoInvestimento || '389',
      agencia: parametros.agencia,
      conta: parametros.conta,
      dataInicio: '01/2024',
      dataFim: '12/2024',
    });

    const valorTotalAplicado = produtos.reduce((acc, p) => acc + p.valorAplicado, 0);
    const valorTotalAtual = produtos.reduce((acc, p) => acc + p.valorAtual, 0);
    const rentabilidadeTotal = valorTotalAtual - valorTotalAplicado;
    const percentualRentabilidade = valorTotalAplicado > 0 ? (rentabilidadeTotal / valorTotalAplicado) * 100 : 0;

    const tiposUnicos = [...new Set(produtos.map((p) => p.tipo))];
    const resumoPorTipo = tiposUnicos.map((tipo) => ({
      tipo,
      quantidade: produtos.filter((p) => p.tipo === tipo).length,
      valorTotal: produtos.filter((p) => p.tipo === tipo).reduce((acc, p) => acc + p.valorAtual, 0),
    }));

    return {
      agencia: parametros.agencia,
      conta: parametros.conta,
      dataReferencia: parametros.dataReferencia || new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
      valorTotalAplicado,
      valorTotalAtual,
      rentabilidadeTotal,
      percentualRentabilidade,
      produtos,
      resumoPorTipo,
    };
  }
}
