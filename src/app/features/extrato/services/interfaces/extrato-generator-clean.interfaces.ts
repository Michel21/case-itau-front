/**
 * Interfaces para geração de extratos seguindo princípios SOLID
 */

import { RendaFixaData } from '../../../../../../types/extrato.types';

// ============================================================================
// CONFIGURAÇÕES E DADOS
// ============================================================================

/**
 * Configuração base para geração de documentos
 */
export interface DocumentConfig {
  titulo: string;
  empresa: string;
  agencia: string;
  conta: string;
  periodo: string;
  dataGeracao: Date;
  numeroControle: string;
}

/**
 * Opções de geração de documentos
 */
export interface GenerationOptions {
  fileName?: string;
  includeRendaFixa?: boolean;
  quality?: 'low' | 'medium' | 'high';
  /** Logo em formato base64 para adicionar ao documento (XLS/PDF) */
  logoBase64?: string;
  /** Imagem em formato base64 para adicionar ao documento (XLS/PDF) */
  imageData?: string;
}

/**
 * Item de extrato padronizado
 */
export interface ExtratoItem {
  data: string;
  descricao: string;
  valor: number;
  saldo: number;
}

/**
 * Dados do extrato
 */
export interface ExtratoData {
  itens: ExtratoItem[];
  rendaFixa?: RendaFixaData;
}

// ============================================================================
// INTERFACES DE SERVIÇOS (Interface Segregation Principle)
// ============================================================================

/**
 * Interface para geração de PDF
 */
export interface IPDFGenerator extends IGenerationStrategy {
  generatePDF(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean>;
}

/**
 * Interface para geração de CSV
 */
export interface ICSVGenerator extends IGenerationStrategy {
  generateCSV(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean>;
}

/**
 * Interface para geração de XLS
 */
export interface IXLSGenerator extends IGenerationStrategy {
  generateXLS(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean>;
}

/**
 * Interface para geração de HTML
 */
export interface IHTMLGenerator extends IGenerationStrategy {
  generateHTML(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): string;
}

/**
 * Interface para formatação de dados
 */
export interface IDataFormatter {
  formatCurrency(value: number): string;
  formatDate(date: Date | string): string;
  formatDateTime(date: Date): string;
  convertBrazilianDate(dateStr: string): Date;
}

/**
 * Interface para construção de templates
 */
export interface ITemplateBuilder {
  buildHeaderTemplate(config: DocumentConfig): string;
  buildTableTemplate(data: ExtratoData): string;
  buildFooterTemplate(config: DocumentConfig): string;
  buildCompleteTemplate(data: ExtratoData, config: DocumentConfig): string;
}

/**
 * Interface para construção de dados XLS
 */
export interface IXLSDataBuilder {
  buildXLSData(data: ExtratoData, config: DocumentConfig): any[][];
  applyXLSFormatting(worksheet: any, data: any[][]): void;
}

/**
 * Interface para download de arquivos
 */
export interface IFileDownloader {
  downloadPDF(blob: Blob, fileName: string): Promise<boolean>;
  downloadCSV(csvContent: string, fileName: string): Promise<boolean>;
}

// ============================================================================
// FACTORY INTERFACES (Dependency Inversion Principle)
// ============================================================================

/**
 * Factory para criação de geradores
 */
export interface IGeneratorFactory {
  createPDFGenerator(): IPDFGenerator;
  createCSVGenerator(): ICSVGenerator;
  createXLSGenerator(): IXLSGenerator;
  createHTMLGenerator(): IHTMLGenerator;
}

/**
 * Factory para criação de utilitários
 */
export interface IUtilityFactory {
  createDataFormatter(): IDataFormatter;
  createTemplateBuilder(): ITemplateBuilder;
  createXLSDataBuilder(): IXLSDataBuilder;
  createFileDownloader(): IFileDownloader;
}

// ============================================================================
// ESTRATÉGIAS (Strategy Pattern para Open/Closed Principle)
// ============================================================================

/**
 * Estratégia de geração de documentos
 */
export interface IGenerationStrategy {
  generate(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean>;
  getSupportedFormat(): string;
}

/**
 * Contexto para estratégias de geração
 */
export interface IGenerationContext {
  setStrategy(strategy: IGenerationStrategy): void;
  execute(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean>;
}

// ============================================================================
// BUILDER PATTERN (para construção complexa)
// ============================================================================

/**
 * Builder para configuração de documentos
 */
export interface IDocumentConfigBuilder {
  setTitulo(titulo: string): IDocumentConfigBuilder;
  setEmpresa(empresa: string): IDocumentConfigBuilder;
  setAgencia(agencia: string): IDocumentConfigBuilder;
  setConta(conta: string): IDocumentConfigBuilder;
  setPeriodo(periodo: string): IDocumentConfigBuilder;
  setDataGeracao(data: Date): IDocumentConfigBuilder;
  setNumeroControle(numero: string): IDocumentConfigBuilder;
  build(): DocumentConfig;
}

/**
 * Builder para opções de geração
 */
export interface IGenerationOptionsBuilder {
  setFileName(fileName: string): IGenerationOptionsBuilder;
  setIncludeRendaFixa(include: boolean): IGenerationOptionsBuilder;
  setQuality(quality: 'low' | 'medium' | 'high'): IGenerationOptionsBuilder;
  build(): GenerationOptions;
}
