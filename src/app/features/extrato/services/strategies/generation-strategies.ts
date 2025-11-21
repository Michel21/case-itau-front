import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSXStyle from 'xlsx-js-style';

import { 
  IGenerationStrategy, 
  DocumentConfig, 
  ExtratoData, 
  GenerationOptions,
  IPDFGenerator,
  ICSVGenerator,
  IXLSGenerator,
  IHTMLGenerator
} from '../interfaces/extrato-generator-clean.interfaces';

import { DataFormatterService } from '../formatters/data-formatter.service';
import { TemplateBuilderService } from '../builders/template-builder.service';
import { XLSDataBuilderService } from '../builders/xls-data-builder.service';
import { WebViewDownloadService } from '../../../../shared/services/webview-download.service';

// ============================================================================
// ESTRATÉGIAS DE GERAÇÃO (Strategy Pattern + Open/Closed Principle)
// ============================================================================

/**
 * Estratégia para geração de PDF
 * Implementa Strategy Pattern para extensibilidade
 */
@Injectable({
  providedIn: 'root'
})
export class PDFGenerationStrategy implements IGenerationStrategy, IPDFGenerator {

  constructor(
    private readonly dataFormatter: DataFormatterService,
    private readonly templateBuilder: TemplateBuilderService,
    private readonly downloadService: WebViewDownloadService
  ) {}

  getSupportedFormat(): string {
    return 'pdf';
  }

  async generate(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean> {
    return this.generatePDF(data, config, options);
  }

  async generatePDF(data: ExtratoData, config: DocumentConfig, options: GenerationOptions = {}): Promise<boolean> {
    try {
      const fileName = this.buildFileName(config, options, 'pdf');
      const htmlContent = this.templateBuilder.buildCompleteTemplate(data, config);
      
      const tempElement = this.createTemporaryElement(htmlContent);
      document.body.appendChild(tempElement);

      await this.waitForRendering();

      const canvas = await this.captureCanvas(tempElement);
      const pdf = this.generatePDFFromCanvas(canvas);

      document.body.removeChild(tempElement);

      const pdfBlob = pdf.output('blob');
      return await this.downloadService.downloadPDF(pdfBlob, fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  // Métodos privados para PDF
  private buildFileName(config: DocumentConfig, options: GenerationOptions, extension: string): string {
    return options.fileName || 
           `extrato-${this.dataFormatter.formatDate(config.dataGeracao).replace(/\//g, '-')}.${extension}`;
  }

  private createTemporaryElement(htmlContent: string): HTMLElement {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    tempElement.style.position = 'absolute';
    tempElement.style.top = '-9999px';
    tempElement.style.left = '-9999px';
    tempElement.style.width = '1000px';
    return tempElement;
  }

  private async waitForRendering(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async captureCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    return html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1000,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1000,
      windowHeight: element.offsetHeight,
      foreignObjectRendering: false,
      removeContainer: true,
      logging: false
    });
  }

  private generatePDFFromCanvas(canvas: HTMLCanvasElement): jsPDF {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = 200;
    const pageHeight = 277;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const centerX = (pageWidth - imgWidth) / 2;

    // Primeira página
    pdf.addImage(imgData, 'PNG', centerX, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Páginas adicionais
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', centerX, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  }
}

/**
 * Estratégia para geração de CSV
 */
@Injectable({
  providedIn: 'root'
})
export class CSVGenerationStrategy implements IGenerationStrategy, ICSVGenerator {

  constructor(
    private readonly dataFormatter: DataFormatterService,
    private readonly downloadService: WebViewDownloadService
  ) {}

  getSupportedFormat(): string {
    return 'csv';
  }

  async generate(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean> {
    return this.generateCSV(data, config, options);
  }

  async generateCSV(data: ExtratoData, config: DocumentConfig, options: GenerationOptions = {}): Promise<boolean> {
    try {
      const fileName = this.buildFileName(config, options, 'csv');
      const csvContent = this.buildCSVContent(data, config);
      
      return await this.downloadService.downloadCSV(csvContent, fileName);

    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      return false;
    }
  }

  private buildFileName(config: DocumentConfig, options: GenerationOptions, extension: string): string {
    return options.fileName || 
           `extrato-${this.dataFormatter.formatDate(config.dataGeracao).replace(/\//g, '-')}.${extension}`;
  }

  private buildCSVContent(data: ExtratoData, config: DocumentConfig): string {
    const lines: string[] = [];
    
    // Cabeçalho do documento
    lines.push(`"${config.empresa}"`);
    lines.push(`"${config.titulo}"`);
    lines.push('');
    lines.push(`"Agência:","${config.agencia}"`);
    lines.push(`"Conta:","${config.conta}"`);
    lines.push(`"Período:","${config.periodo}"`);
    lines.push(`"Data de Geração:","${this.dataFormatter.formatDate(config.dataGeracao)}"`);
    lines.push('');
    
    // Cabeçalho da tabela
    lines.push('"Data","Descrição","Valor","Saldo"');
    
    // Dados da tabela
    if (data.itens && data.itens.length > 0) {
      data.itens.forEach(item => {
        const dataFormatada = this.dataFormatter.formatDate(item.data);
        const valorFormatado = this.dataFormatter.formatCurrency(item.valor);
        const saldoFormatado = this.dataFormatter.formatCurrency(item.saldo);
        
        lines.push(`"${dataFormatada}","${this.escapeCSV(item.descricao)}","${valorFormatado}","${saldoFormatado}"`);
      });
    }
    
    return lines.join('\n');
  }

  private escapeCSV(text: string): string {
    if (!text) return '';
    return text.replace(/"/g, '""');
  }
}

/**
 * Estratégia para geração de XLS
 */
@Injectable({
  providedIn: 'root'
})
export class XLSGenerationStrategy implements IGenerationStrategy, IXLSGenerator {

  constructor(
    private readonly xlsDataBuilder: XLSDataBuilderService,
    private readonly dataFormatter: DataFormatterService,
    private readonly downloadService: WebViewDownloadService
  ) {}

  getSupportedFormat(): string {
    return 'xls';
  }

  async generate(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean> {
    return this.generateXLS(data, config, options);
  }

  async generateXLS(data: ExtratoData, config: DocumentConfig, options: GenerationOptions = {}): Promise<boolean> {
    try {
      const fileName = this.buildFileName(config, options, 'xlsx');
      const imageData = options.logoBase64 || options.imageData; // Suporte para logo em base64
      const workbook = this.createWorkbook(data, config, imageData);
      
      const xlsxBuffer = XLSXStyle.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        compression: true
      });
      
      const blob = new Blob([xlsxBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      return await this.downloadService.downloadPDF(blob, fileName);

    } catch (error) {
      console.error('Erro ao gerar XLS:', error);
      return false;
    }
  }

  private buildFileName(config: DocumentConfig, options: GenerationOptions, extension: string): string {
    return options.fileName || 
           `extrato-${this.dataFormatter.formatDate(config.dataGeracao).replace(/\//g, '-')}.${extension}`;
  }

  private createWorkbook(data: ExtratoData, config: DocumentConfig, imageData?: string): any {
    const workbook = XLSXStyle.utils.book_new();
    const xlsData = this.xlsDataBuilder.buildXLSData(data, config);
    const worksheet = XLSXStyle.utils.aoa_to_sheet(xlsData);
    
    this.xlsDataBuilder.applyXLSFormatting(worksheet, xlsData);
    
    XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Extrato');
    
    // Adicionar imagem se fornecida
    if (imageData) {
      this.xlsDataBuilder.addImageToWorkbook(workbook, imageData, 'Extrato', {
        col: 0,
        row: 0,
        width: 3,
        height: 4
      });
    }
    
    return workbook;
  }
}

/**
 * Estratégia para geração de HTML
 */
@Injectable({
  providedIn: 'root'
})
export class HTMLGenerationStrategy implements IGenerationStrategy, IHTMLGenerator {

  constructor(
    private readonly templateBuilder: TemplateBuilderService
  ) {}

  getSupportedFormat(): string {
    return 'html';
  }

  async generate(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean> {
    // Para HTML, retornamos sempre true pois é geração síncrona
    this.generateHTML(data, config, options);
    return true;
  }

  generateHTML(data: ExtratoData, config: DocumentConfig, options: GenerationOptions = {}): string {
    return this.templateBuilder.buildCompleteTemplate(data, config);
  }
}

// ============================================================================
// CONTEXTO PARA ESTRATÉGIAS (Strategy Pattern)
// ============================================================================

/**
 * Contexto que gerencia as estratégias de geração
 * Implementa Strategy Pattern para extensibilidade sem modificação
 */
@Injectable({
  providedIn: 'root'
})
export class GenerationContext {
  private strategy: IGenerationStrategy | null = null;

  setStrategy(strategy: IGenerationStrategy): void {
    this.strategy = strategy;
  }

  async execute(data: ExtratoData, config: DocumentConfig, options?: GenerationOptions): Promise<boolean> {
    if (!this.strategy) {
      throw new Error('Nenhuma estratégia de geração foi configurada');
    }

    return this.strategy.generate(data, config, options);
  }

  getSupportedFormat(): string {
    if (!this.strategy) {
      throw new Error('Nenhuma estratégia de geração foi configurada');
    }

    return this.strategy.getSupportedFormat();
  }
}
