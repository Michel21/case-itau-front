import { Injectable } from '@angular/core';
import { 
  IGeneratorFactory, 
  IUtilityFactory,
  IPDFGenerator,
  ICSVGenerator,
  IXLSGenerator,
  IHTMLGenerator,
  IDataFormatter,
  ITemplateBuilder,
  IXLSDataBuilder,
  IFileDownloader
} from '../interfaces/extrato-generator-clean.interfaces';

import { DataFormatterService } from '../formatters/data-formatter.service';
import { TemplateBuilderService } from '../builders/template-builder.service';
import { XLSDataBuilderService } from '../builders/xls-data-builder.service';
import { WebViewDownloadService } from '../../../../shared/services/webview-download.service';

import { 
  PDFGenerationStrategy,
  CSVGenerationStrategy,
  XLSGenerationStrategy,
  HTMLGenerationStrategy
} from '../strategies/generation-strategies';

/**
 * Factory para criação de geradores
 * Implementa Factory Pattern e Dependency Inversion Principle
 */
@Injectable({
  providedIn: 'root'
})
export class GeneratorFactoryService implements IGeneratorFactory {

  constructor(
    private readonly dataFormatter: DataFormatterService,
    private readonly templateBuilder: TemplateBuilderService,
    private readonly xlsDataBuilder: XLSDataBuilderService,
    private readonly downloadService: WebViewDownloadService
  ) {}

  createPDFGenerator(): IPDFGenerator {
    return new PDFGenerationStrategy(
      this.dataFormatter,
      this.templateBuilder,
      this.downloadService
    );
  }

  createCSVGenerator(): ICSVGenerator {
    return new CSVGenerationStrategy(
      this.dataFormatter,
      this.downloadService
    );
  }

  createXLSGenerator(): IXLSGenerator {
    return new XLSGenerationStrategy(
      this.xlsDataBuilder,
      this.dataFormatter,
      this.downloadService
    );
  }

  createHTMLGenerator(): IHTMLGenerator {
    return new HTMLGenerationStrategy(
      this.templateBuilder
    );
  }
}

/**
 * Factory para criação de utilitários
 * Implementa Factory Pattern para criação consistente
 */
@Injectable({
  providedIn: 'root'
})
export class UtilityFactoryService implements IUtilityFactory {

  constructor(
    private readonly dataFormatter: DataFormatterService,
    private readonly templateBuilder: TemplateBuilderService,
    private readonly xlsDataBuilder: XLSDataBuilderService,
    private readonly downloadService: WebViewDownloadService
  ) {}

  createDataFormatter(): IDataFormatter {
    return this.dataFormatter;
  }

  createTemplateBuilder(): ITemplateBuilder {
    return this.templateBuilder;
  }

  createXLSDataBuilder(): IXLSDataBuilder {
    return this.xlsDataBuilder;
  }

  createFileDownloader(): IFileDownloader {
    return this.downloadService;
  }
}

/**
 * Factory principal que combina todas as factories
 * Implementa Abstract Factory Pattern
 */
@Injectable({
  providedIn: 'root'
})
export class ExtratoFactoryService {

  constructor(
    private readonly generatorFactory: GeneratorFactoryService,
    private readonly utilityFactory: UtilityFactoryService
  ) {}

  // Getters para as factories
  get generators(): IGeneratorFactory {
    return this.generatorFactory;
  }

  get utilities(): IUtilityFactory {
    return this.utilityFactory;
  }

  // Métodos de conveniência para criação rápida
  createPDFGenerator(): IPDFGenerator {
    return this.generatorFactory.createPDFGenerator();
  }

  createCSVGenerator(): ICSVGenerator {
    return this.generatorFactory.createCSVGenerator();
  }

  createXLSGenerator(): IXLSGenerator {
    return this.generatorFactory.createXLSGenerator();
  }

  createHTMLGenerator(): IHTMLGenerator {
    return this.generatorFactory.createHTMLGenerator();
  }

  createDataFormatter(): IDataFormatter {
    return this.utilityFactory.createDataFormatter();
  }

  createTemplateBuilder(): ITemplateBuilder {
    return this.utilityFactory.createTemplateBuilder();
  }

  createXLSDataBuilder(): IXLSDataBuilder {
    return this.utilityFactory.createXLSDataBuilder();
  }

  createFileDownloader(): IFileDownloader {
    return this.utilityFactory.createFileDownloader();
  }

  // Método para criar gerador baseado no tipo
  createGeneratorByType(type: 'pdf' | 'csv' | 'xls' | 'html'): IPDFGenerator | ICSVGenerator | IXLSGenerator | IHTMLGenerator {
    switch (type) {
      case 'pdf':
        return this.createPDFGenerator();
      case 'csv':
        return this.createCSVGenerator();
      case 'xls':
        return this.createXLSGenerator();
      case 'html':
        return this.createHTMLGenerator();
      default:
        throw new Error(`Tipo de gerador não suportado: ${type}`);
    }
  }
}
