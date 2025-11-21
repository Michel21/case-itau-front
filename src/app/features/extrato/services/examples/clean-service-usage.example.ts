import { Injectable } from '@angular/core';
import { ExtratoGeneratorCleanService } from '../extrato-generator-clean.service';
import { DocumentConfig, ExtratoData, GenerationOptions } from '../interfaces/extrato-generator-clean.interfaces';

/**
 * Exemplos práticos de uso do ExtratoGeneratorCleanService
 * Demonstra as diferentes formas de utilizar a nova arquitetura
 */
@Injectable({
  providedIn: 'root'
})
export class CleanServiceUsageExamplesService {

  constructor(private readonly extratoService: ExtratoGeneratorCleanService) {}

  // ============================================================================
  // EXEMPLOS BÁSICOS
  // ============================================================================

  /**
   * Exemplo 1: Uso básico - Geração simples de PDF
   */
  async exemploBasico(): Promise<boolean> {
    // Dados de exemplo
    const data: ExtratoData = {
      itens: [
        {
          data: '01/01/2024',
          descricao: 'Depósito inicial',
          valor: 1000.00,
          saldo: 1000.00
        },
        {
          data: '02/01/2024',
          descricao: 'Compra loja online',
          valor: -150.00,
          saldo: 850.00
        }
      ]
    };

    // Configuração simples
    const config: DocumentConfig = {
      titulo: 'Extrato Bancário',
      empresa: 'Banco Exemplo',
      agencia: '0001',
      conta: '12345-6',
      periodo: 'Janeiro 2024',
      dataGeracao: new Date(),
      numeroControle: 'CTRL-001'
    };

    // Geração direta
    return await this.extratoService.generatePDF(data, config);
  }

  /**
   * Exemplo 2: Uso com Builder Pattern
   */
  async exemploComBuilder(): Promise<boolean> {
    const data: ExtratoData = {
      itens: [
        { data: '01/01/2024', descricao: 'Salário', valor: 5000, saldo: 5000 },
        { data: '05/01/2024', descricao: 'Aluguel', valor: -1200, saldo: 3800 }
      ]
    };

    // Usando Builder para configuração
    const config = this.extratoService.createValidatedConfig({
      titulo: 'Extrato Detalhado',
      empresa: 'Minha Empresa LTDA',
      agencia: '1234',
      conta: '987654-0',
      periodo: 'Janeiro 2024'
    });

    // Opções customizadas
    const options: GenerationOptions = {
      fileName: 'extrato-janeiro-2024.pdf',
      includeRendaFixa: true,
      quality: 'high'
    };

    return await this.extratoService.generatePDF(data, config, options);
  }

  // ============================================================================
  // EXEMPLOS AVANÇADOS
  // ============================================================================

  /**
   * Exemplo 3: Geração de múltiplos formatos
   */
  async exemploMultiplosFormatos(): Promise<Map<string, boolean | string>> {
    const data: ExtratoData = {
      itens: [
        { data: '01/01/2024', descricao: 'Transferência PIX', valor: -500, saldo: 2500 }
      ]
    };

    const config = this.extratoService.createValidatedConfig({
      titulo: 'Extrato Completo',
      empresa: 'Banco Digital'
    });

    // Gera PDF, CSV e XLS simultaneamente
    const results = await this.extratoService.generateMultipleFormats(
      ['pdf', 'csv', 'xls'],
      data,
      config
    );

    // Log dos resultados
    results.forEach((success, format) => {
      console.log(`${format.toUpperCase()}: ${success ? 'Sucesso' : 'Erro'}`);
    });

    return results;
  }

  /**
   * Exemplo 4: Geração com diferentes qualidades
   */
  async exemploQualidades(data: ExtratoData, config: DocumentConfig): Promise<void> {
    // Alta qualidade (melhor resultado, mais lento)
    console.log('Gerando PDF alta qualidade...');
    const highQuality = await this.extratoService.generateHighQuality('pdf', data, config);
    console.log('Alta qualidade:', highQuality ? 'Sucesso' : 'Erro');

    // Qualidade normal (balanceado)
    console.log('Gerando CSV qualidade normal...');
    const normal = await this.extratoService.generateCSV(data, config);
    console.log('Normal:', normal ? 'Sucesso' : 'Erro');

    // Baixa qualidade (mais rápido)
    console.log('Gerando XLS baixa qualidade...');
    const fast = await this.extratoService.generateFast('xls', data, config);
    console.log('Rápido:', fast ? 'Sucesso' : 'Erro');
  }

  /**
   * Exemplo 5: Geração condicional por formato
   */
  async exemploCondicional(formato: 'pdf' | 'csv' | 'xls' | 'html'): Promise<boolean | string> {
    const data: ExtratoData = {
      itens: [
        { data: '01/01/2024', descricao: 'Saldo inicial', valor: 0, saldo: 1000 }
      ]
    };

    const config = this.extratoService.createValidatedConfig({
      titulo: `Extrato ${formato.toUpperCase()}`,
      empresa: 'Banco Flexível'
    });

    try {
      // Validação do formato
      if (!this.extratoService.getSupportedFormats().includes(formato)) {
        throw new Error(`Formato ${formato} não suportado`);
      }

      // Geração por formato
      return await this.extratoService.generateByFormat(formato, data, config);

    } catch (error) {
      console.error('Erro na geração:', error);
      return false;
    }
  }

  // ============================================================================
  // EXEMPLOS DE TRATAMENTO DE ERROS
  // ============================================================================

  /**
   * Exemplo 6: Tratamento robusto de erros
   */
  async exemploTratamentoErros(): Promise<void> {
    try {
      // Dados inválidos propositalmente
      const invalidData = { itens: null } as any;
      const config = this.extratoService.createValidatedConfig({});

      await this.extratoService.generatePDF(invalidData, config);

    } catch (error) {
      console.error('Erro capturado corretamente:', error);
      
      // Fallback: tentar com dados válidos
      const validData: ExtratoData = { itens: [] };
      const success = await this.extratoService.generatePDF(validData, config);
      
      console.log('Fallback executado:', success ? 'Sucesso' : 'Erro');
    }
  }

  /**
   * Exemplo 7: Validação antes da geração
   */
  async exemploValidacao(data: ExtratoData, config: DocumentConfig): Promise<boolean> {
    // Validações manuais
    if (!this.extratoService.validateExtratoData(data)) {
      console.error('Dados do extrato inválidos');
      return false;
    }

    if (!this.extratoService.validateDocumentConfig(config)) {
      console.error('Configuração do documento inválida');
      return false;
    }

    // Geração apenas se validações passaram
    console.log('Validações ok, iniciando geração...');
    return await this.extratoService.generatePDF(data, config);
  }

  // ============================================================================
  // EXEMPLOS DE INTEGRAÇÃO
  // ============================================================================

  /**
   * Exemplo 8: Integração com componente Angular
   */
  async integracaoComponente(dadosFormulario: any): Promise<void> {
    // Transformar dados do formulário
    const data: ExtratoData = {
      itens: dadosFormulario.transacoes.map((t: any) => ({
        data: t.data,
        descricao: t.descricao,
        valor: parseFloat(t.valor),
        saldo: parseFloat(t.saldo)
      }))
    };

    // Configuração a partir do formulário
    const config = this.extratoService.createValidatedConfig({
      titulo: dadosFormulario.titulo || 'Extrato Personalizado',
      empresa: dadosFormulario.empresa,
      periodo: `${dadosFormulario.dataInicio} a ${dadosFormulario.dataFim}`
    });

    // Opções baseadas nas preferências do usuário
    const options: GenerationOptions = {
      quality: dadosFormulario.qualidade || 'medium',
      includeRendaFixa: dadosFormulario.incluirRendaFixa || false
    };

    // Geração baseada na escolha do usuário
    const formatos = dadosFormulario.formatos || ['pdf'];
    const results = await this.extratoService.generateMultipleFormats(
      formatos,
      data,
      config,
      options
    );

    // Feedback para o usuário
    this.processarResultados(results);
  }

  /**
   * Exemplo 9: Uso com RxJS/Observables
   */
  gerarExtratoObservable(data: ExtratoData, config: DocumentConfig) {
    return new Promise<boolean>((resolve, reject) => {
      this.extratoService.generatePDF(data, config)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Exemplo 10: Pipeline de geração em lote
   */
  async exemploLote(extratos: Array<{ data: ExtratoData; config: DocumentConfig }>): Promise<void> {
    console.log(`Iniciando geração em lote de ${extratos.length} extratos...`);

    const resultados = await Promise.allSettled(
      extratos.map(({ data, config }, index) =>
        this.extratoService.generatePDF(data, {
          ...config,
          numeroControle: `LOTE-${Date.now()}-${index}`
        })
      )
    );

    // Análise dos resultados
    const sucessos = resultados.filter(r => r.status === 'fulfilled' && r.value).length;
    const erros = resultados.length - sucessos;

    console.log(`Lote concluído: ${sucessos} sucessos, ${erros} erros`);
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private processarResultados(results: Map<string, boolean | string>): void {
    results.forEach((result, format) => {
      if (typeof result === 'boolean') {
        console.log(`${format}: ${result ? 'Download iniciado' : 'Erro na geração'}`);
      } else {
        console.log(`${format}: HTML gerado (${result.length} caracteres)`);
      }
    });
  }

  /**
   * Utilitário para criar dados de teste
   */
  criarDadosTeste(numeroTransacoes: number = 5): ExtratoData {
    const itens = [];
    let saldo = 1000;

    for (let i = 0; i < numeroTransacoes; i++) {
      const valor = (Math.random() - 0.5) * 1000; // Valores entre -500 e +500
      saldo += valor;

      itens.push({
        data: new Date(2024, 0, i + 1).toLocaleDateString('pt-BR'),
        descricao: `Transação ${i + 1}`,
        valor: Math.round(valor * 100) / 100,
        saldo: Math.round(saldo * 100) / 100
      });
    }

    return { itens };
  }

  /**
   * Utilitário para criar configuração de teste
   */
  criarConfigTeste(overrides: Partial<DocumentConfig> = {}): DocumentConfig {
    return this.extratoService.createValidatedConfig({
      titulo: 'Extrato de Teste',
      empresa: 'Banco de Testes LTDA',
      agencia: '9999',
      conta: '888888-8',
      periodo: 'Janeiro 2024',
      ...overrides
    });
  }
}

/**
 * Exemplos de uso em diferentes cenários
 */
export class UseCaseExamples {

  constructor(private readonly extratoService: ExtratoGeneratorCleanService) {}

  /**
   * Cenário 1: E-commerce - Extrato de vendas
   */
  async extratoVendas(): Promise<boolean> {
    const vendas: ExtratoData = {
      itens: [
        { data: '01/01/2024', descricao: 'Venda Produto A', valor: 250.00, saldo: 250.00 },
        { data: '01/01/2024', descricao: 'Venda Produto B', valor: 150.00, saldo: 400.00 },
        { data: '02/01/2024', descricao: 'Comissão Marketplace', valor: -40.00, saldo: 360.00 }
      ]
    };

    const config = this.extratoService.createValidatedConfig({
      titulo: 'Extrato de Vendas',
      empresa: 'Loja Virtual LTDA',
      periodo: 'Janeiro 2024'
    });

    return await this.extratoService.generateHighQuality('pdf', vendas, config);
  }

  /**
   * Cenário 2: Contabilidade - Relatório financeiro
   */
  async relatorioFinanceiro(): Promise<Map<string, boolean | string>> {
    const movimentacao: ExtratoData = {
      itens: [
        { data: '01/01/2024', descricao: 'Receita Operacional', valor: 10000, saldo: 10000 },
        { data: '05/01/2024', descricao: 'Despesas Operacionais', valor: -3000, saldo: 7000 },
        { data: '15/01/2024', descricao: 'Investimentos', valor: -2000, saldo: 5000 }
      ]
    };

    const config = this.extratoService.createValidatedConfig({
      titulo: 'Relatório Financeiro Mensal',
      empresa: 'Empresa ABC S.A.',
      periodo: 'Janeiro 2024'
    });

    // Gera em múltiplos formatos para diferentes stakeholders
    return await this.extratoService.generateMultipleFormats(
      ['pdf', 'csv', 'xls'], // PDF para apresentação, CSV/XLS para análise
      movimentacao,
      config
    );
  }

  /**
   * Cenário 3: Personal Finance - Extrato pessoal
   */
  async extratoPessoal(): Promise<boolean> {
    const gastos: ExtratoData = {
      itens: [
        { data: '01/01/2024', descricao: 'Salário', valor: 5000, saldo: 5000 },
        { data: '03/01/2024', descricao: 'Supermercado', valor: -350, saldo: 4650 },
        { data: '05/01/2024', descricao: 'Combustível', valor: -200, saldo: 4450 },
        { data: '10/01/2024', descricao: 'Aluguel', valor: -1200, saldo: 3250 }
      ]
    };

    const config = this.extratoService.createValidatedConfig({
      titulo: 'Controle Financeiro Pessoal',
      empresa: 'Finanças Pessoais',
      periodo: 'Janeiro 2024'
    });

    const options: GenerationOptions = {
      fileName: 'meu-extrato-janeiro.pdf',
      quality: 'medium'
    };

    return await this.extratoService.generatePDF(gastos, config, options);
  }
}
