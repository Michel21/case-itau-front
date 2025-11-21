import { Injectable } from '@angular/core';
import { 
  DocumentConfig, 
  ExtratoData, 
  GenerationOptions,
  IGenerationStrategy,
  IPDFGenerator,
  ICSVGenerator,
  IXLSGenerator,
  IHTMLGenerator
} from './interfaces/extrato-generator-clean.interfaces';

import { ExtratoFactoryService } from './factories/generation-factory.service';
import { BuilderFactoryService } from './builders/config-builders.service';
import { 
  GenerationContext,
  PDFGenerationStrategy,
  CSVGenerationStrategy,
  XLSGenerationStrategy,
  HTMLGenerationStrategy
} from './strategies/generation-strategies';

/**
 * Serviço principal para geração de extratos
 * 
 * Implementa todos os princípios SOLID:
 * - SRP: Responsabilidade única de coordenar a geração de extratos
 * - OCP: Extensível para novos formatos sem modificação
 * - LSP: Estratégias são substituíveis entre si
 * - ISP: Interfaces segregadas por responsabilidade
 * - DIP: Depende de abstrações, não de implementações concretas
 * 
 * Aplica padrões Clean Code:
 * - Nomes descritivos e intencionais
 * - Funções pequenas e focadas
 * - Comentários apenas quando necessário
 * - Tratamento adequado de erros
 */
@Injectable({
  providedIn: 'root'
})
export class ExtratoGeneratorCleanService {

  private readonly generationContext: GenerationContext;

  constructor(
    private readonly factoryService: ExtratoFactoryService,
    private readonly builderFactory: BuilderFactoryService,
    generationContext: GenerationContext
  ) {
    this.generationContext = generationContext;
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS PRINCIPAIS (Clean Code: Interface clara e simples)
  // ============================================================================

  /**
   * Gera PDF do extrato
   * 
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração (opcional)
   * @returns Promise<boolean> indicando sucesso da operação
   */
  async generatePDF(
    data: ExtratoData, 
    config: DocumentConfig, 
    options?: GenerationOptions
  ): Promise<boolean> {
    return this.executeWithStrategy(
      this.factoryService.createPDFGenerator(),
      data,
      config,
      options
    );
  }

  /**
   * Gera CSV do extrato
   * 
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração (opcional)
   * @returns Promise<boolean> indicando sucesso da operação
   */
  async generateCSV(
    data: ExtratoData, 
    config: DocumentConfig, 
    options?: GenerationOptions
  ): Promise<boolean> {
    return this.executeWithStrategy(
      this.factoryService.createCSVGenerator(),
      data,
      config,
      options
    );
  }

  /**
   * Gera XLS do extrato
   * 
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração (opcional)
   * @returns Promise<boolean> indicando sucesso da operação
   */
  async generateXLS(
    data: ExtratoData, 
    config: DocumentConfig, 
    options?: GenerationOptions
  ): Promise<boolean> {
    return this.executeWithStrategy(
      this.factoryService.createXLSGenerator(),
      data,
      config,
      options
    );
  }

  /**
   * Gera HTML do extrato
   * 
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração (opcional)
   * @returns String com conteúdo HTML
   */
  generateHTML(
    data: ExtratoData, 
    config: DocumentConfig, 
    options?: GenerationOptions
  ): string {
    const htmlGenerator = this.factoryService.createHTMLGenerator();
    return htmlGenerator.generateHTML(data, config, options);
  }

  /**
   * Gera extrato no formato especificado
   * 
   * @param format Formato desejado ('pdf', 'csv', 'xls', 'html')
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração (opcional)
   * @returns Promise<boolean | string> resultado da geração
   */
  async generateByFormat(
    format: 'pdf' | 'csv' | 'xls' | 'html',
    data: ExtratoData,
    config: DocumentConfig,
    options?: GenerationOptions
  ): Promise<boolean | string> {
    this.validateFormat(format);
    
    switch (format) {
      case 'pdf':
        return this.generatePDF(data, config, options);
      case 'csv':
        return this.generateCSV(data, config, options);
      case 'xls':
        return this.generateXLS(data, config, options);
      case 'html':
        return this.generateHTML(data, config, options);
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  // ============================================================================
  // MÉTODOS DE CONVENIÊNCIA (Clean Code: Facilitam uso comum)
  // ============================================================================

  /**
   * Gera extrato com configuração padrão
   * 
   * @param format Formato desejado
   * @param data Dados do extrato
   * @returns Promise<boolean | string> resultado da geração
   */
  async generateWithDefaultConfig(
    format: 'pdf' | 'csv' | 'xls' | 'html',
    data: ExtratoData
  ): Promise<boolean | string> {
    const defaultConfig = this.builderFactory.createDefaultDocumentConfig();
    const defaultOptions = this.builderFactory.createDefaultGenerationOptions();
    
    return this.generateByFormat(format, data, defaultConfig, defaultOptions);
  }

  /**
   * Gera extrato de alta qualidade
   * 
   * @param format Formato desejado
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @returns Promise<boolean | string> resultado da geração
   */
  async generateHighQuality(
    format: 'pdf' | 'csv' | 'xls' | 'html',
    data: ExtratoData,
    config: DocumentConfig
  ): Promise<boolean | string> {
    const highQualityOptions = this.builderFactory.createHighQualityOptions();
    return this.generateByFormat(format, data, config, highQualityOptions);
  }

  /**
   * Gera extrato rápido (baixa qualidade)
   * 
   * @param format Formato desejado
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @returns Promise<boolean | string> resultado da geração
   */
  async generateFast(
    format: 'pdf' | 'csv' | 'xls' | 'html',
    data: ExtratoData,
    config: DocumentConfig
  ): Promise<boolean | string> {
    const fastOptions = this.builderFactory.createFastOptions();
    return this.generateByFormat(format, data, config, fastOptions);
  }

  /**
   * Gera múltiplos formatos simultaneamente
   * 
   * @param formats Array de formatos desejados
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração (opcional)
   * @returns Promise<Map<string, boolean | string>> mapa com resultados por formato
   */
  async generateMultipleFormats(
    formats: Array<'pdf' | 'csv' | 'xls' | 'html'>,
    data: ExtratoData,
    config: DocumentConfig,
    options?: GenerationOptions
  ): Promise<Map<string, boolean | string>> {
    const results = new Map<string, boolean | string>();
    
    // Executa gerações em paralelo para melhor performance
    const promises = formats.map(async (format) => {
      try {
        const result = await this.generateByFormat(format, data, config, options);
        results.set(format, result);
      } catch (error) {
        console.error(`Erro ao gerar formato ${format}:`, error);
        results.set(format, false);
      }
    });

    await Promise.all(promises);
    return results;
  }

  // ============================================================================
  // MÉTODOS UTILITÁRIOS (Clean Code: Funções auxiliares bem nomeadas)
  // ============================================================================

  /**
   * Obtém os formatos suportados
   * 
   * @returns Array<string> com formatos disponíveis
   */
  getSupportedFormats(): string[] {
    return ['pdf', 'csv', 'xls', 'html'];
  }

  /**
   * Valida se os dados do extrato são válidos
   * 
   * @param data Dados do extrato
   * @returns boolean indicando se os dados são válidos
   */
  validateExtratoData(data: ExtratoData): boolean {
    return data !== null && 
           data !== undefined && 
           Array.isArray(data.itens);
  }

  /**
   * Valida se a configuração do documento é válida
   * 
   * @param config Configuração do documento
   * @returns boolean indicando se a configuração é válida
   */
  validateDocumentConfig(config: DocumentConfig): boolean {
    const required = ['titulo', 'empresa', 'agencia', 'conta', 'periodo', 'dataGeracao', 'numeroControle'];
    return required.every(field => 
      config[field as keyof DocumentConfig] !== null && 
      config[field as keyof DocumentConfig] !== undefined &&
      config[field as keyof DocumentConfig] !== ''
    );
  }

  /**
   * Cria uma configuração de documento com validação
   * 
   * @param partial Configuração parcial
   * @returns DocumentConfig completa ou lança erro se inválida
   */
  createValidatedConfig(partial: Partial<DocumentConfig>): DocumentConfig {
    try {
      return this.builderFactory
        .createDocumentConfigBuilder()
        .setTitulo(partial.titulo || 'Extrato Bancário')
        .setEmpresa(partial.empresa || 'Banco Exemplo')
        .setAgencia(partial.agencia || '0001')
        .setConta(partial.conta || '12345-6')
        .setPeriodo(partial.periodo || 'Período não especificado')
        .setDataGeracao(partial.dataGeracao || new Date())
        .setNumeroControle(partial.numeroControle || this.generateControlNumber())
        .build();
    } catch (error) {
      throw new Error(`Erro ao criar configuração válida: ${error}`);
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS (Clean Code: Lógica interna bem organizada)
  // ============================================================================

  /**
   * Executa geração usando estratégia específica
   * 
   * @param strategy Estratégia de geração
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @param options Opções de geração
   * @returns Promise<boolean> resultado da operação
   */
  private async executeWithStrategy(
    strategy: IGenerationStrategy,
    data: ExtratoData,
    config: DocumentConfig,
    options?: GenerationOptions
  ): Promise<boolean> {
    this.validateInputs(data, config);
    
    try {
      this.generationContext.setStrategy(strategy);
      return await this.generationContext.execute(data, config, options);
    } catch (error) {
      this.handleGenerationError(error, strategy.getSupportedFormat());
      return false;
    }
  }

  /**
   * Valida inputs antes da geração
   * 
   * @param data Dados do extrato
   * @param config Configuração do documento
   * @throws Error se inputs são inválidos
   */
  private validateInputs(data: ExtratoData, config: DocumentConfig): void {
    if (!this.validateExtratoData(data)) {
      throw new Error('Dados do extrato inválidos');
    }

    if (!this.validateDocumentConfig(config)) {
      throw new Error('Configuração do documento inválida');
    }
  }

  /**
   * Valida formato solicitado
   * 
   * @param format Formato a ser validado
   * @throws Error se formato não é suportado
   */
  private validateFormat(format: string): void {
    if (!this.getSupportedFormats().includes(format)) {
      throw new Error(`Formato não suportado: ${format}. Formatos disponíveis: ${this.getSupportedFormats().join(', ')}`);
    }
  }

  /**
   * Trata erros de geração de forma consistente
   * 
   * @param error Erro ocorrido
   * @param format Formato que estava sendo gerado
   */
  private handleGenerationError(error: any, format: string): void {
    const errorMessage = `Erro ao gerar ${format.toUpperCase()}`;
    console.error(errorMessage, error);
    
    // Em produção, poderia enviar métricas ou logs para monitoramento
    // this.metricsService.recordError(errorMessage, error);
  }

  /**
   * Gera número de controle único
   * 
   * @returns string com número de controle
   */
  private generateControlNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CTRL-${timestamp.slice(-6)}-${random}`;
  }

  // ============================================================================
  // MÉTODOS PARA COMPATIBILIDADE (Clean Code: Migração gradual)
  // ============================================================================

  /**
   * Método de compatibilidade com versão anterior
   * @deprecated Use generatePDF em vez disso
   */
  async gerarPDF(extratoData: any, config: any, options: any = {}): Promise<boolean> {
    console.warn('gerarPDF está depreciado. Use generatePDF.');
    return this.generatePDF(extratoData, config, options);
  }

  /**
   * Método de compatibilidade com versão anterior
   * @deprecated Use generateCSV em vez disso
   */
  async gerarCSV(extratoData: any, config: any, options: any = {}): Promise<boolean> {
    console.warn('gerarCSV está depreciado. Use generateCSV.');
    return this.generateCSV(extratoData, config, options);
  }

  /**
   * Método de compatibilidade com versão anterior
   * @deprecated Use generateXLS em vez disso
   */
  async gerarXLS(extratoData: any, config: any, options: any = {}): Promise<boolean> {
    console.warn('gerarXLS está depreciado. Use generateXLS.');
    return this.generateXLS(extratoData, config, options);
  }

  /**
   * Método de compatibilidade com versão anterior
   * @deprecated Não é mais necessário, cache foi removido
   */
  clearCache(): void {
    console.warn('clearCache está depreciado. Cache foi removido na nova versão.');
    // Método vazio para compatibilidade
  }
}
