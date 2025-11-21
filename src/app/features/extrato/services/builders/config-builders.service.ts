import { Injectable } from '@angular/core';
import { 
  IDocumentConfigBuilder, 
  IGenerationOptionsBuilder,
  DocumentConfig,
  GenerationOptions
} from '../interfaces/extrato-generator-clean.interfaces';

/**
 * Builder para configuração de documentos
 * Implementa Builder Pattern para construção fluente e flexível
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentConfigBuilderService implements IDocumentConfigBuilder {
  
  private config: Partial<DocumentConfig> = {};

  setTitulo(titulo: string): IDocumentConfigBuilder {
    this.config.titulo = titulo;
    return this;
  }

  setEmpresa(empresa: string): IDocumentConfigBuilder {
    this.config.empresa = empresa;
    return this;
  }

  setAgencia(agencia: string): IDocumentConfigBuilder {
    this.config.agencia = agencia;
    return this;
  }

  setConta(conta: string): IDocumentConfigBuilder {
    this.config.conta = conta;
    return this;
  }

  setPeriodo(periodo: string): IDocumentConfigBuilder {
    this.config.periodo = periodo;
    return this;
  }

  setDataGeracao(data: Date): IDocumentConfigBuilder {
    this.config.dataGeracao = data;
    return this;
  }

  setNumeroControle(numero: string): IDocumentConfigBuilder {
    this.config.numeroControle = numero;
    return this;
  }

  build(): DocumentConfig {
    this.validateRequiredFields();
    
    const result = { ...this.config } as DocumentConfig;
    this.reset();
    
    return result;
  }

  reset(): IDocumentConfigBuilder {
    this.config = {};
    return this;
  }

  // Método estático para criação rápida com valores padrão
  static createDefault(): DocumentConfig {
    return new DocumentConfigBuilderService()
      .setTitulo('Extrato Bancário')
      .setEmpresa('Banco Exemplo')
      .setAgencia('0001')
      .setConta('12345-6')
      .setPeriodo('01/01/2024 a 31/01/2024')
      .setDataGeracao(new Date())
      .setNumeroControle(this.generateControlNumber())
      .build();
  }

  // Método estático para criação a partir de objeto parcial
  static fromPartial(partial: Partial<DocumentConfig>): IDocumentConfigBuilder {
    const builder = new DocumentConfigBuilderService();
    
    if (partial.titulo) builder.setTitulo(partial.titulo);
    if (partial.empresa) builder.setEmpresa(partial.empresa);
    if (partial.agencia) builder.setAgencia(partial.agencia);
    if (partial.conta) builder.setConta(partial.conta);
    if (partial.periodo) builder.setPeriodo(partial.periodo);
    if (partial.dataGeracao) builder.setDataGeracao(partial.dataGeracao);
    if (partial.numeroControle) builder.setNumeroControle(partial.numeroControle);
    
    return builder;
  }

  private validateRequiredFields(): void {
    const required = ['titulo', 'empresa', 'agencia', 'conta', 'periodo', 'dataGeracao', 'numeroControle'];
    const missing = required.filter(field => !this.config[field as keyof DocumentConfig]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios ausentes na configuração do documento: ${missing.join(', ')}`);
    }
  }

  private static generateControlNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CTRL-${timestamp.slice(-6)}-${random}`;
  }
}

/**
 * Builder para opções de geração
 * Implementa Builder Pattern para configuração flexível de opções
 */
@Injectable({
  providedIn: 'root'
})
export class GenerationOptionsBuilderService implements IGenerationOptionsBuilder {
  
  private options: Partial<GenerationOptions> = {};

  setFileName(fileName: string): IGenerationOptionsBuilder {
    this.options.fileName = fileName;
    return this;
  }

  setIncludeRendaFixa(include: boolean): IGenerationOptionsBuilder {
    this.options.includeRendaFixa = include;
    return this;
  }

  setQuality(quality: 'low' | 'medium' | 'high'): IGenerationOptionsBuilder {
    this.options.quality = quality;
    return this;
  }

  build(): GenerationOptions {
    const result = { ...this.options };
    this.reset();
    return result;
  }

  reset(): IGenerationOptionsBuilder {
    this.options = {};
    return this;
  }

  // Método estático para criação de opções padrão
  static createDefault(): GenerationOptions {
    return new GenerationOptionsBuilderService()
      .setIncludeRendaFixa(true)
      .setQuality('medium')
      .build();
  }

  // Método estático para criação de opções de alta qualidade
  static createHighQuality(): GenerationOptions {
    return new GenerationOptionsBuilderService()
      .setIncludeRendaFixa(true)
      .setQuality('high')
      .build();
  }

  // Método estático para criação de opções de baixa qualidade (rápida)
  static createFast(): GenerationOptions {
    return new GenerationOptionsBuilderService()
      .setIncludeRendaFixa(false)
      .setQuality('low')
      .build();
  }

  // Método estático para criação a partir de objeto parcial
  static fromPartial(partial: Partial<GenerationOptions>): IGenerationOptionsBuilder {
    const builder = new GenerationOptionsBuilderService();
    
    if (partial.fileName) builder.setFileName(partial.fileName);
    if (partial.includeRendaFixa !== undefined) builder.setIncludeRendaFixa(partial.includeRendaFixa);
    if (partial.quality) builder.setQuality(partial.quality);
    
    return builder;
  }

  // Método estático para criação com nome de arquivo específico
  static withFileName(fileName: string): IGenerationOptionsBuilder {
    return new GenerationOptionsBuilderService()
      .setFileName(fileName)
      .setIncludeRendaFixa(true)
      .setQuality('medium');
  }
}

/**
 * Factory para Builders
 * Centraliza a criação de builders para facilitar injeção de dependência
 */
@Injectable({
  providedIn: 'root'
})
export class BuilderFactoryService {

  createDocumentConfigBuilder(): IDocumentConfigBuilder {
    return new DocumentConfigBuilderService();
  }

  createGenerationOptionsBuilder(): IGenerationOptionsBuilder {
    return new GenerationOptionsBuilderService();
  }

  // Métodos de conveniência para criação rápida
  createDefaultDocumentConfig(): DocumentConfig {
    return DocumentConfigBuilderService.createDefault();
  }

  createDefaultGenerationOptions(): GenerationOptions {
    return GenerationOptionsBuilderService.createDefault();
  }

  createHighQualityOptions(): GenerationOptions {
    return GenerationOptionsBuilderService.createHighQuality();
  }

  createFastOptions(): GenerationOptions {
    return GenerationOptionsBuilderService.createFast();
  }

  // Método para criação completa com valores padrão
  createDefaultConfiguration(): { config: DocumentConfig; options: GenerationOptions } {
    return {
      config: this.createDefaultDocumentConfig(),
      options: this.createDefaultGenerationOptions()
    };
  }

  // Método para criação de configuração para ambiente de produção
  createProductionConfiguration(empresa: string, titulo: string): { config: DocumentConfig; options: GenerationOptions } {
    const config = new DocumentConfigBuilderService()
      .setTitulo(titulo)
      .setEmpresa(empresa)
      .setAgencia('0001')
      .setConta('12345-6')
      .setPeriodo(`${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleDateString('pt-BR')}`)
      .setDataGeracao(new Date())
      .setNumeroControle(this.generateProductionControlNumber())
      .build();

    const options = GenerationOptionsBuilderService.createHighQuality();

    return { config, options };
  }

  private generateProductionControlNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    
    return `PROD-${year}${month}${day}-${time}`;
  }
}
