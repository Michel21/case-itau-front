import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-js-style';
import { WebViewDownloadService } from '../../../shared/services/webview-download.service';
import { RendaFixaData } from '../../../../../types/extrato.types';
import { RENDA_FIXA_DATA, MOCK_EXTRATO_DATA } from '../../../../../data/mock-extrato.data';

// Importações dos serviços modulares essenciais
import { DocumentFormatterService } from './formatters/document-formatter.service';

/**
 * Interface para configuração do extrato
 */
export interface ExtratoConfig {
  titulo: string;
  empresa: string;
  agencia: string;
  conta: string;
  periodo: string;
  dataGeracao: Date;
  numeroControle: string;
  itens: any[];
  rendaFixa?: RendaFixaData;
}

/**
 * Interface para opções de geração
 */
export interface GeracaoOptions {
  fileName?: string;
  includeRendaFixa?: boolean;
  format?: 'pdf' | 'csv' | 'html' | 'xls';
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Interface para item de extrato simples
 */
export interface ExtratoItemSimples {
  data: string;
  descricao: string;
  valor: number;
  saldo: number;
}

/**
 * Interface para extrato simples
 */
export interface ExtratoSimples {
  itens: ExtratoItemSimples[];
}

/**
 * Serviço para geração de PDF e CSV de extratos
 * Independente do template HTML
 */
@Injectable({
  providedIn: 'root'
})
export class ExtratoGeneratorService {
  
  constructor(
    private readonly webViewDownloadService: WebViewDownloadService,
    private readonly formatter: DocumentFormatterService
  ) {}
  
  /**
   * Método para compatibilidade (vazio)
   */
  clearCache(): void {
    // Removido: cache não é mais necessário
  }

  /**
   * Gera PDF do extrato
   */
  async gerarPDF(
    extratoData: ExtratoSimples,
    config: ExtratoConfig,
    options: GeracaoOptions = {}
  ): Promise<boolean> {
    try {
      const fileName = options.fileName || `extrato-${this.formatarData(config.dataGeracao).replace(/\//g, '-')}.pdf`;
      const htmlContent = this.gerarHTMLParaPDF(extratoData, config, options);
      
      // Criar elemento temporário
      const tempElement = this.criarElementoTemporario(htmlContent);
      document.body.appendChild(tempElement);

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capturar com html2canvas (configurações do gerarPDFCorporativo)
      const canvas = await html2canvas(tempElement, {
        scale: 2, // Scale fixo para qualidade consistente
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000, // Largura fixa
        height: tempElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000, // Largura fixa
        windowHeight: tempElement.offsetHeight,
        foreignObjectRendering: false,
        removeContainer: true,
        logging: false
      });

      // Gerar PDF
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

      // Remover elemento temporário
      document.body.removeChild(tempElement);

      // Download
      const pdfBlob = pdf.output('blob');
      return await this.webViewDownloadService.downloadPDF(pdfBlob, fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  /**
   * Gera CSV do extrato
   */
  async gerarCSV(
    extratoData: ExtratoSimples,
    config: ExtratoConfig,
    options: GeracaoOptions = {}
  ): Promise<boolean> {
    try {
      const fileName = options.fileName || `extrato-${this.formatarData(config.dataGeracao)}.csv`;
      
      // Gerar conteúdo CSV
      const csvContent = this.gerarConteudoCSV(extratoData, config, options);
      
      // Download
      return await this.webViewDownloadService.downloadCSV(csvContent, fileName);

    } catch (error) {
      return false;
    }
  }

  /**
   * Gera arquivo XLS com cores usando xlsx-js-style
   */
  async gerarXLS(
    extratoData: ExtratoSimples,
    config: ExtratoConfig,
    options: GeracaoOptions = {}
  ): Promise<boolean> {
    try {
      const fileName = options.fileName || `extrato-${this.formatarData(config.dataGeracao)}.xlsx`;
      
      // Criar workbook e worksheet com cores
      const workbook = XLSXStyle.utils.book_new();
      const worksheetData = this.gerarDadosXLSComCores(extratoData, config, options);
      const worksheet = XLSXStyle.utils.aoa_to_sheet(worksheetData);

      // Aplicar formatação com cores
      this.aplicarFormatacaoXLSComCores(worksheet, worksheetData);

      // Adicionar worksheet ao workbook
      XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Saldo e Extrato');

      // Gerar arquivo com formatação
      const xlsBuffer = XLSXStyle.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Erro ao gerar XLS:', error);
      return false;
    }
  }


  /**
   * Gera HTML completo do extrato
   */
  public gerarHTML(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions = {}): string {
    return this.gerarHTMLDoExtrato(extratoData, config, options);
  }

  /**
   * Gera HTML para conversão em PDF
   */
  private gerarHTMLParaPDF(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions): string {
    return this.gerarHTMLDoExtrato(extratoData, config, options);
  }

  /**
   * Gera HTML do extrato (método principal)
   */
  private gerarHTMLDoExtrato(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions): string {
    const css = this.gerarCSS();
    const header = this.gerarHeader(config);
    const body = this.gerarBody(extratoData, config, options);
    const footer = this.gerarFooter(config);

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.titulo}</title>
        <style>${css}</style>
      </head>
      <body>
        ${header}
        ${body}
        ${footer}
      </body>
      </html>
    `;
  }

  /**
   * Gera CSS para o extrato
   */
  private gerarCSS(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.3;
        color: #000;
        background: #fff;
      }
      
      .extrato-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 25px;
        background: #fff;
        min-height: 100vh;
      }
      
      .extrato-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
        padding-bottom: 15px;
        position: relative;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 25px;
        padding-bottom: 15px;
        position: relative;
      }
      
      .header-left {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
      }
      
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #cc0000;
        margin-bottom: 2px;
        text-transform: none;
      }
      
      .subtitle {
        font-size: 16px;
        color: #000;
        margin-bottom: 4px;
        text-transform: none;
        font-weight: normal;
      }
      
      .global-solutions {
        font-size: 14px;
        color: #666;
        text-transform: none;
        font-weight: normal;
      }
      
      .header-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        text-align: right;
        margin-left: auto;
        min-width: 300px;
      }
      
      .report-title {
        font-size: 18px;
        font-weight: bold;
        color: #001e61;
        margin-bottom: 10px;
      }
      
      .transaction-details {
        font-size: 12px;
        color: #555;
        line-height: 1.4;
      }
      
      .search-details {
        background-color: #fff;
        padding: 8px 0;
        border: none;
        margin-bottom: 12px;
        border-radius: 0;
      }
      
      .search-details h3 {
        color: #000;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: bold;
      }
      
      .detail-grid {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        padding: 1px 0;
        border-bottom: none;
        font-size: 11px;
        margin-bottom: 1px;
      }
      
      .detail-label {
        font-weight: bold;
        color: #000;
        display: inline;
        min-width: 120px;
        margin-right: 8px;
        text-align: right;
      }
      
      .detail-value {
        color: #000;
        display: inline;
      }
      
      .table-section {
        margin-bottom: 25px;
      }
      
      .table-container {
        margin-bottom: 25px;
        background: #fff;
        padding: 0;
      }
      
      .financial-table {
        width: 100%;
        border-collapse: collapse;
        background-color: #fff;
        font-size: 10px;
        border: none;
      }
      
      .table-header {
        background-color: #ddd;
        padding: 12px 0;
      }
      
      .financial-table th {
        background-color: transparent;
        color: #000;
        padding: 8px 4px;
        text-align: center;
        border: none;
        font-weight: bold;
        font-size: 11px;
      }
      
      .financial-table td {
        padding: 6px 4px;
        text-align: center;
        border: none;
        color: #000;
        font-size: 11px;
      }
      
      .section-title {
        background-color: #eee;
        padding: 12px 0;
      }
      
      .section-title th {
        background-color: #eee;
        color: #000;
        padding: 12px 35px;
        text-align: left;
        font-weight: bold;
        font-size: 12px;
      }
      
      .data-row {
        background-color: transparent;
      }
      
      .data-row:nth-child(even) {
        background-color: transparent;
      }
      
      .total-row {
        background-color: transparent !important;
        color: #000 !important;
        font-weight: bold;
        padding: 8px 0 !important;
        margin-bottom: 10px;
      }
      
      .total-row td {
        color: #000 !important;
        border-color: transparent !important;
        border-bottom: none !important;
        padding: 8px 4px;
      }
      
      .total-row td:first-child {
        text-align: left !important;
        padding-left: 0px !important;
      }
      
      .total-row td:nth-child(2),
      .total-row td:nth-child(3),
      .total-row td:nth-child(4) {
        text-align: center !important;
      }
      
      .total-row td:nth-child(5),
      .total-row td:nth-child(6),
      .total-row td:nth-child(7),
      .total-row td:nth-child(8),
      .total-row td:nth-child(9),
      .total-row td:nth-child(10),
      .total-row td:nth-child(11) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      /* Alinhamento específico baseado no componente original */
      .financial-table th:nth-child(1),
      .financial-table td:nth-child(1) {
        text-align: left !important;
        padding-left: 20px !important;
      }
      
      .financial-table th:nth-child(2),
      .financial-table td:nth-child(2) {
        text-align: left !important;
        padding-left: 3px !important;
      }
      
      .financial-table th:nth-child(3),
      .financial-table td:nth-child(3) {
        text-align: left !important;
        padding-left: 3px !important;
      }
      
      .financial-table th:nth-child(4),
      .financial-table td:nth-child(4) {
        text-align: center !important;
      }
      
      .financial-table th:nth-child(5),
      .financial-table td:nth-child(5) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      .financial-table th:nth-child(6),
      .financial-table td:nth-child(6) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      .financial-table th:nth-child(7),
      .financial-table td:nth-child(7) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      .financial-table th:nth-child(8),
      .financial-table td:nth-child(8) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      .financial-table th:nth-child(9),
      .financial-table td:nth-child(9) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      .financial-table th:nth-child(10),
      .financial-table td:nth-child(10) {
        text-align: right !important;
        padding-right: 3px !important;
      }
      
      .financial-table th:nth-child(11),
      .financial-table td:nth-child(11) {
        text-align: right !important;
        padding-right: 10px !important;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-left {
        text-align: left;
      }
      
      .text-center {
        text-align: center;
      }
      
      .total-row {
        color: #fff !important;
        font-weight: bold;
      }
      
      .total-row td {
        border: 1px solid #001e61;
        padding: 10px 8px;
      }
      
      .section {
        margin-bottom: 30px;
      }
      
      .section h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #001e61;
        border-bottom: 2px solid #001e61;
        padding-bottom: 5px;
      }
      
      .section h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #001e61;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 11px;
      }
      
      th, td {
        padding: 8px;
        text-align: left;
        border: 1px solid #dbdbdb;
      }
      
      th {
        background-color: #f4f4f9;
        font-weight: bold;
        color: #001e61;
      }
      
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #dbdbdb;
        padding-top: 15px;
      }
      
      @media print {
        body { margin: 0; }
        .extrato-container { margin: 0; padding: 10px; }
        .financial-table { page-break-inside: avoid; }
      }
    `;
  }

  /**
   * Gera header do extrato (replicando o layout do Bradesco)
   */
  private gerarHeader(config: ExtratoConfig): string {
    return `
      <header class="extrato-header">
        <div class="header-content">
          <div class="header-left">
            <div class="logo">bradesco</div>
            <div class="subtitle">corporate</div>
            <div class="global-solutions">global solutions</div>
          </div>
          <div class="header-right">
            <div class="report-title">Saldo e extrato</div>
            <div class="transaction-details">
              <div>Data da transação: 25/08/2025 - 10:57:09</div>
              <div>Número de controle: 27dc6a7d-4003-4574-b3bb-fae182b17962</div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  /**
   * Gera body do extrato (replicando exatamente o layout do app-extrato-pdf)
   */
  private gerarBody(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions): string {
    let body = '';

    // Seção de detalhes da pesquisa
    body += this.gerarSecaoDetalhesPesquisa(config);

    // Tabela principal (como no app-extrato-pdf)
    body += this.gerarTabelaPrincipal();

    return body;
  }

  /**
   * Gera seção de detalhes da pesquisa (replicando o layout do Bradesco)
   */
  private gerarSecaoDetalhesPesquisa(config: ExtratoConfig): string {
    return `
      <section class="search-details">
        <h3>Detalhes da Pesquisa</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Empresa | CNPJ:</span>
            <span class="detail-value">43.320.901 LUCIANO RAMOS | 43.320.901/0001-50</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Agência | Conta:</span>
            <span class="detail-value">1221 | 35394-9</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Data da busca:</span>
            <span class="detail-value">Agosto/2025</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipo de investimento:</span>
            <span class="detail-value">CDB - Certificado de Depósito Bancário</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipo de Produto:</span>
            <span class="detail-value">Invest Facil Bradesco</span>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Gera tabela principal (replicando exatamente o layout do app-extrato-pdf)
   */
  private gerarTabelaPrincipal(): string {
    // Usar array para melhor performance com strings grandes
    const htmlParts = [
      '<section class="table-section">',
      '<div class="table-container">',
      '<table class="financial-table">',
      '<thead>',
      '<tr class="table-header">',
      '<th>Data aplic.</th>',
      '<th>Data vencto.</th>',
      '<th>Resgate/Carência</th>',
      '<th>Taxa (%)</th>',
      '<th>Valor princ. (BRL)</th>',
      '<th>Valor Bruto (BRL)</th>',
      '<th>Renda total (BRL)</th>',
      '<th>IOF (BRL)</th>',
      '<th>IRRF (BRL)</th>',
      '<th>Valor Líquido (BRL)</th>',
      '<th>Renda bruta per</th>',
      '</tr>',
      '</thead>',
      '<tbody>',
      this.gerarSecaoSaldoAnteriorDados(),
      this.gerarSecaoAplicacoesDados(),
      this.gerarHeaderRepetido(),
      this.gerarSecaoResgatesDados(),
      this.gerarSecaoSaldoFinalDados(),
      '</tbody>',
      '</table>',
      '</div>',
      '</section>'
    ];
    
    return htmlParts.join('');
  }

  /**
   * Gera seção de saldo anterior usando dados reais do mock
   */
  private gerarSecaoSaldoAnteriorDados(): string {
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;
    let html = `
      <tr class="section-title">
        <th colspan="11" style="padding-left: 35px !important;">Saldo anterior em ${rendaFixa.dataSaldoAnterior}</th>
      </tr>
    `;
    
    // Dados do saldo anterior
    if (rendaFixa.saldoAnterior && rendaFixa.saldoAnterior.length > 0) {
      rendaFixa.saldoAnterior.forEach((item: any) => {
        html += `
          <tr class="data-row">
            <td>${item.dataAplicacao || ''}</td>
            <td>${item.dataVencimento || ''}</td>
            <td>${item.datasResgate || ''}</td>
            <td>${item.taxa ? item.taxa.toFixed(2) : ''}</td>
            <td>${this.formatarMoeda(item.valorPrincipal || 0)}</td>
            <td>${this.formatarMoeda(item.valorBruto || 0)}</td>
            <td>${this.formatarMoeda(item.rendaTotal || 0)}</td>
            <td>${this.formatarMoeda(item.iof || 0)}</td>
            <td>${this.formatarMoeda(item.irrf || 0)}</td>
            <td>${this.formatarMoeda(item.valoLiquido || 0)}</td>
            <td>${this.formatarMoeda(item.rendaBruta || 0)}</td>
          </tr>
        `;
      });
    }
    
    // Total do saldo anterior
    const total = rendaFixa.saldoAteriorTotal;
    if (total) {
      html += `
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td></td>
          <td></td>
          <td></td>
          <td><strong>${this.formatarMoeda(total.valorPrincipal || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.valorBruto || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.rendaTotal || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.iof || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.irrf || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.valoLiquido || 0)}</strong></td>
          <td style="padding-right: 10px !important;"><strong>${this.formatarMoeda(total.rendaBruta || 0)}</strong></td>
        </tr>
      `;
    }
    
    return html;
  }

  /**
   * Gera seção de aplicações usando dados reais do mock
   */
  private gerarSecaoAplicacoesDados(): string {
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;
    let html = `
      <tr class="section-title">
        <th colspan="11" style="padding-left: 35px !important;">Aplicações</th>
      </tr>
    `;
    
    // Dados das aplicações
    if (rendaFixa.aplicacao && rendaFixa.aplicacao.length > 0) {
      rendaFixa.aplicacao.forEach((item: any) => {
        html += `
          <tr class="data-row">
            <td>${item.dataAplicacao || ''}</td>
            <td>${item.dataVencimento || ''}</td>
            <td>-</td>
            <td>${item.taxa ? item.taxa.toFixed(2) : ''}</td>
            <td>${this.formatarMoeda(item.valorPrincipal || 0)}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `;
      });
    }
    
    // Total das aplicações
    const total = rendaFixa.aplicacaoTotal;
    if (total) {
      html += `
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td></td>
          <td></td>
          <td></td>
          <td><strong>${this.formatarMoeda(total.valorPrincipal || 0)}</strong></td>
          <td><strong></strong></td>
          <td><strong></strong></td>
          <td><strong></strong></td>
          <td><strong></strong></td>
          <td><strong></strong></td>
          <td><strong></strong></td>
        </tr>
      `;
    }
    
    return html;
  }

  /**
   * Gera header repetido
   */
  private gerarHeaderRepetido(): string {
    return [
      '<tr class="table-header">',
      '<th>Data aplic.</th>',
      '<th>Data vencto.</th>',
      '<th>Resgate/Carência</th>',
      '<th>Taxa (%)</th>',
      '<th>Valor princ. (BRL)</th>',
      '<th>Valor Bruto (BRL)</th>',
      '<th>Renda total (BRL)</th>',
      '<th>IOF (BRL)</th>',
      '<th>IRRF (BRL)</th>',
      '<th>Valor Líquido (BRL)</th>',
      '<th>Renda bruta per</th>',
      '</tr>'
    ].join('');
  }

  /**
   * Gera seção de resgates usando dados reais do mock
   */
  private gerarSecaoResgatesDados(): string {
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;
    let html = `
      <tr class="section-title">
        <th colspan="11" style="padding-left: 35px !important;">Resgates/Vencimentos</th>
      </tr>
    `;
    
    // Dados dos resgates
    if (rendaFixa.resgate && rendaFixa.resgate.length > 0) {
      rendaFixa.resgate.forEach((item: any) => {
        html += `
          <tr class="data-row">
            <td>${item.dataAplicacao || ''}</td>
            <td>${item.dataVencimento || ''}</td>
            <td>${item.datasResgate || ''}</td>
            <td>${item.taxa ? item.taxa.toFixed(2) : ''}</td>
            <td>${this.formatarMoeda(item.valorPrincipal || 0)}</td>
            <td>${this.formatarMoeda(item.valorBruto || 0)}</td>
            <td>${this.formatarMoeda(item.rendaTotal || 0)}</td>
            <td>${this.formatarMoeda(item.iof || 0)}</td>
            <td>${this.formatarMoeda(item.irrf || 0)}</td>
            <td>${this.formatarMoeda(item.valoLiquido || 0)}</td>
            <td>${this.formatarMoeda(item.rendaBruta || 0)}</td>
          </tr>
        `;
      });
    }
    
    // Total dos resgates
    const total = rendaFixa.resgateTotal;
    if (total) {
      html += `
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td></td>
          <td></td>
          <td></td>
          <td><strong>${this.formatarMoeda(total.valorPrincipal || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.valorBruto || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.rendaTotal || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.iof || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.irrf || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.valoLiquido || 0)}</strong></td>
          <td style="padding-right: 10px !important;"><strong>${this.formatarMoeda(total.rendaBruta || 0)}</strong></td>
        </tr>
      `;
    }
    
    return html;
  }

  /**
   * Gera seção de saldo final usando dados reais do mock
   */
  private gerarSecaoSaldoFinalDados(): string {
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;
    let html = `
      <tr class="section-title">
        <th colspan="11" style="padding-left: 35px !important;">Saldo final em ${rendaFixa.dataSaldoFinal}</th>
      </tr>
    `;
    
    // Dados do saldo final
    if (rendaFixa.saldoFinal && rendaFixa.saldoFinal.length > 0) {
      rendaFixa.saldoFinal.forEach((item: any) => {
        html += `
          <tr class="data-row">
            <td>${item.dataAplicacao || ''}</td>
            <td>${item.dataVencimento || ''}</td>
            <td>${item.datasResgate || ''}</td>
            <td>${item.taxa ? item.taxa.toFixed(2) : ''}</td>
            <td>${this.formatarMoeda(item.valorPrincipal || 0)}</td>
            <td>${this.formatarMoeda(item.valorBruto || 0)}</td>
            <td>${this.formatarMoeda(item.rendaTotal || 0)}</td>
            <td>${this.formatarMoeda(item.iof || 0)}</td>
            <td>${this.formatarMoeda(item.irrf || 0)}</td>
            <td>${this.formatarMoeda(item.valoLiquido || 0)}</td>
            <td>${this.formatarMoeda(item.rendaBruta || 0)}</td>
          </tr>
        `;
      });
    }
    
    // Total do saldo final
    const total = rendaFixa.saldoFinalTotal;
    if (total) {
      html += `
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td></td>
          <td></td>
          <td></td>
          <td><strong>${this.formatarMoeda(total.valorPrincipal || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.valorBruto || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.rendaTotal || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.iof || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.irrf || 0)}</strong></td>
          <td><strong>${this.formatarMoeda(total.valoLiquido || 0)}</strong></td>
          <td style="padding-right: 10px !important;"><strong>${this.formatarMoeda(total.rendaBruta || 0)}</strong></td>
        </tr>
      `;
    }
    
    return html;
  }

  /**
   * Gera footer do extrato
   */
  private gerarFooter(config: ExtratoConfig): string {
    return `
      <div class="footer">
        <p>Documento gerado em ${this.formatarDataHora(config.dataGeracao)}</p>
        <p>Número de Controle: ${config.numeroControle}</p>
      </div>
    `;
  }

  /**
   * Gera conteúdo CSV
   */
  private gerarConteudoCSV(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions): string {
    let csv = '';
    
    // Header do CSV com colunas da renda fixa
    csv += 'Seção,Data Aplicação,Data Vencimento,Data Resgate,Taxa (%),Valor Principal (BRL),Valor Bruto (BRL),Renda Total (BRL),IOF (BRL),IRRF (BRL),Valor Líquido (BRL),Renda Bruta (%)\n';
    
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;
    
    // Saldo Anterior
    if (rendaFixa.saldoAnterior && rendaFixa.saldoAnterior.length > 0) {
      rendaFixa.saldoAnterior.forEach((item: any) => {
        csv += `"Saldo Anterior","${item.dataAplicacao || ''}","${item.dataVencimento || ''}","${item.datasResgate || ''}","${item.taxa || ''}","${this.formatarMoeda(item.valorPrincipal || 0)}","${this.formatarMoeda(item.valorBruto || 0)}","${this.formatarMoeda(item.rendaTotal || 0)}","${this.formatarMoeda(item.iof || 0)}","${this.formatarMoeda(item.irrf || 0)}","${this.formatarMoeda(item.valoLiquido || 0)}","${this.formatarMoeda(item.rendaBruta || 0)}"\n`;
      });
      
      // Total do Saldo Anterior
      const total = rendaFixa.saldoAteriorTotal;
      if (total) {
        csv += `"Total Saldo Anterior","","","","","${this.formatarMoeda(total.valorPrincipal || 0)}","${this.formatarMoeda(total.valorBruto || 0)}","${this.formatarMoeda(total.rendaTotal || 0)}","${this.formatarMoeda(total.iof || 0)}","${this.formatarMoeda(total.irrf || 0)}","${this.formatarMoeda(total.valoLiquido || 0)}","${this.formatarMoeda(total.rendaBruta || 0)}"\n`;
      }
    }
    
    // Aplicações
    if (rendaFixa.aplicacao && rendaFixa.aplicacao.length > 0) {
      rendaFixa.aplicacao.forEach((item: any) => {
        csv += `"Aplicações","${item.dataAplicacao || ''}","${item.dataVencimento || ''}","-","${item.taxa || ''}","${this.formatarMoeda(item.valorPrincipal || 0)}","","","","","",""\n`;
      });
      
      // Total das Aplicações
      const total = rendaFixa.aplicacaoTotal;
      if (total) {
        csv += `"Total Aplicações","","","","","${this.formatarMoeda(total.valorPrincipal || 0)}","","","","","",""\n`;
      }
    }
    
    // Resgates/Vencimentos
    if (rendaFixa.resgate && rendaFixa.resgate.length > 0) {
      rendaFixa.resgate.forEach((item: any) => {
        csv += `"Resgates/Vencimentos","${item.dataAplicacao || ''}","${item.dataVencimento || ''}","${item.datasResgate || ''}","${item.taxa || ''}","${this.formatarMoeda(item.valorPrincipal || 0)}","${this.formatarMoeda(item.valorBruto || 0)}","${this.formatarMoeda(item.rendaTotal || 0)}","${this.formatarMoeda(item.iof || 0)}","${this.formatarMoeda(item.irrf || 0)}","${this.formatarMoeda(item.valoLiquido || 0)}","${this.formatarMoeda(item.rendaBruta || 0)}"\n`;
      });
      
      // Total dos Resgates
      const total = rendaFixa.resgateTotal;
      if (total) {
        csv += `"Total Resgates","","","","","${this.formatarMoeda(total.valorPrincipal || 0)}","${this.formatarMoeda(total.valorBruto || 0)}","${this.formatarMoeda(total.rendaTotal || 0)}","${this.formatarMoeda(total.iof || 0)}","${this.formatarMoeda(total.irrf || 0)}","${this.formatarMoeda(total.valoLiquido || 0)}","${this.formatarMoeda(total.rendaBruta || 0)}"\n`;
      }
    }
    
    // Saldo Final
    if (rendaFixa.saldoFinal && rendaFixa.saldoFinal.length > 0) {
      rendaFixa.saldoFinal.forEach((item: any) => {
        csv += `"Saldo Final","${item.dataAplicacao || ''}","${item.dataVencimento || ''}","${item.datasResgate || ''}","${item.taxa || ''}","${this.formatarMoeda(item.valorPrincipal || 0)}","${this.formatarMoeda(item.valorBruto || 0)}","${this.formatarMoeda(item.rendaTotal || 0)}","${this.formatarMoeda(item.iof || 0)}","${this.formatarMoeda(item.irrf || 0)}","${this.formatarMoeda(item.valoLiquido || 0)}","${this.formatarMoeda(item.rendaBruta || 0)}"\n`;
      });
      
      // Total do Saldo Final
      const total = rendaFixa.saldoFinalTotal;
      if (total) {
        csv += `"Total Saldo Final","","","","","${this.formatarMoeda(total.valorPrincipal || 0)}","${this.formatarMoeda(total.valorBruto || 0)}","${this.formatarMoeda(total.rendaTotal || 0)}","${this.formatarMoeda(total.iof || 0)}","${this.formatarMoeda(total.irrf || 0)}","${this.formatarMoeda(total.valoLiquido || 0)}","${this.formatarMoeda(total.rendaBruta || 0)}"\n`;
      }
    }
    
    return csv;
  }


  /**
   * Cria elemento temporário para renderização (método legado - mantido para compatibilidade)
   */
  private criarElementoTemporario(htmlContent: string): HTMLElement {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Aplicar estilos específicos do PDF (replicando gerarPDFCorporativo)
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '1000px'; // Largura fixa para garantir consistência
    tempDiv.style.maxWidth = '1000px';
    tempDiv.style.minWidth = '1000px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.color = '#000000';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.margin = '0';
    tempDiv.style.padding = '5px';
    tempDiv.style.border = 'none';
    tempDiv.style.boxShadow = 'none';
    tempDiv.style.visibility = 'visible';
    tempDiv.style.display = 'block';
    tempDiv.style.overflow = 'visible';
    tempDiv.style.transform = 'none'; // Remover transformações
    tempDiv.style.transformOrigin = 'top left';

    // Garantir que as tabelas tenham largura fixa
    const tableElements = tempDiv.querySelectorAll('table');
    tableElements.forEach(table => {
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.minWidth = '990px'; // 1000px - 10px de padding
      (table as HTMLElement).style.maxWidth = '990px';
      (table as HTMLElement).style.tableLayout = 'fixed';
    });

    // Garantir que as células tenham larguras consistentes
    const thElements = tempDiv.querySelectorAll('th');
    thElements.forEach((th, index) => {
      const colWidth = this.getColumnWidth(index);
      (th as HTMLElement).style.width = colWidth;
      (th as HTMLElement).style.minWidth = colWidth;
      (th as HTMLElement).style.maxWidth = colWidth;
    });

    const tdElements = tempDiv.querySelectorAll('td');
    tdElements.forEach((td, index) => {
      const colWidth = this.getColumnWidth(index);
      (td as HTMLElement).style.width = colWidth;
      (td as HTMLElement).style.minWidth = colWidth;
      (td as HTMLElement).style.maxWidth = colWidth;
    });

    // Ocultar apenas elementos desnecessários no PDF
    const buttons = tempDiv.querySelectorAll('button');
    buttons.forEach(button => {
      (button as HTMLElement).style.display = 'none';
    });

    const icons = tempDiv.querySelectorAll('i');
    icons.forEach(icon => {
      (icon as HTMLElement).style.display = 'none';
    });
    
    return tempDiv;
  }

  /**
   * Formata moeda usando o serviço modular
   */
  private formatarMoeda(valor: number): string {
    return this.formatter.formatCurrency(valor);
  }

  /**
   * Formata data usando o serviço modular
   */
  private formatarData(data: Date): string {
    return this.formatter.formatDate(data);
  }

  /**
   * Formata data e hora usando o serviço modular
   */
  private formatarDataHora(data: Date): string {
    return this.formatter.formatDateTime(data);
  }

  /**
   * Retorna largura da coluna (replicando do ExtratoPdfComponent)
   */
  private getColumnWidth(index: number): string {
    switch (index) {
      case 0: return '80px';  // Data Aplicação
      case 1: return '80px';  // Data Vencimento
      case 2: return '80px';  // Data Resgate
      case 3: return '60px';  // Taxa
      case 4: return '70px';  // Valor Principal
      case 5: return '70px';  // Valor Bruto
      case 6: return '70px';  // Renda Total
      case 7: return '50px';  // IOF
      case 8: return '50px';  // IRRF
      case 9: return '70px';  // Valor Líquido
      case 10: return '70px'; // Renda Bruta
      default: return '70px';
    }
  }

  /**
   * Converte data brasileira (DD/MM/YYYY) para objeto Date
   */
  private converterDataBrasileira(dataBr: string): Date {
    if (!dataBr) return new Date();
    const partes = dataBr.split('/');
    if (partes.length !== 3) return new Date();
    // new Date(ano, mês-1, dia)
    return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
  }

  /**
   * Gera dados estruturados para XLS com cores usando xlsx-style
   */
  private gerarDadosXLSComCores(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions): any[][] {
    const dados: any[][] = [];
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;

    // Header Bradesco - replicando exatamente a imagem
    dados.push(['🏦 bradesco', '', '', '', '', '', '', '', '', '', '', '', '']);
    dados.push(['empresas e negócios', '', '', '', '', '', '', '', '', '', '', '', '']);
    
    // Linhas vazias
    for (let i = 0; i < 5; i++) {
      dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);
    }

    // Título - replicando a imagem (sem fundo, centralizado)
    dados.push(['Saldo e Extrato', '', '', '', '', '', '', '', '', '', '', '', '']);

    // Data da transação - replicando a imagem
    const dataAtual = this.formatarDataHora(new Date());
    dados.push(['Data da transação:', dataAtual, '', '', '', '', '', '', '', '', '', '', '']);

    // Linha vazia
    dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);

    // Detalhes da Pesquisa - replicando a imagem
    dados.push(['Detalhes da Pesquisa', '', '', '', '', '', '', '', '', '', '', '', '']);

    // Dados básicos - usando dados do RENDA_FIXA_DATA
    const formatarDataBusca = (data: string) => {
      const date = this.converterDataBrasileira(data);
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${meses[date.getMonth()]}/${date.getFullYear()}`;
    };
    const dataBusca = formatarDataBusca(rendaFixa.dataSaldoAnterior);
    dados.push(['Agência | Conta:', '', '2 | 35108-3', '', '', '', '', '', '', '', '', '', '']);
    dados.push(['Data da busca:', '', dataBusca, '', '', '', '', '', '', '', '', '', '']);
    dados.push(['Tipo de investimento:', '', 'Fundos de Investimentos', '', '', '', '', '', '', '', '', '', '']);
    dados.push(['Tipo de Produto:', '', 'Bradesco FIC FI RF Referenciado DI Max', '', '', '', '', '', '', '', '', '', '']);

    // Linha vazia
    dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);

    // Header da tabela - replicando exatamente as colunas da imagem
    dados.push([
      'Data aplicação',
      'Resgate/Carência',
      'Quantidade de Cotas',
      'Valor princ. (BRL)',
      'Valor da Cota',
      'Valor Brut.',
      'Renda tot.',
      'IOF (BRL)',
      'IRRF (BRL)',
      'Valor Líqu',
      'Renda bruta per',
      '',
      ''
    ]);

    // Saldo anterior - usando dados do RENDA_FIXA_DATA
    const dataSaldoAnterior = this.formatarData(this.converterDataBrasileira(rendaFixa.dataSaldoAnterior));
    dados.push(['', `Saldo anterior em ${dataSaldoAnterior}`, '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.saldoAnterior && rendaFixa.saldoAnterior.length > 0) {
      const saldoAnt = rendaFixa.saldoAnterior[0];
      dados.push([
        this.formatarData(this.converterDataBrasileira(saldoAnt.dataAplicacao)),
        '50.450.472430000',
        '',
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.valorPrincipal),
        '649615000',
        this.formatarMoeda(saldoAnt.valorBruto),
        this.formatarMoeda(saldoAnt.rendaTotal),
        this.formatarMoeda(saldoAnt.iof),
        this.formatarMoeda(saldoAnt.irrf),
        this.formatarMoeda(saldoAnt.valoLiquido),
        '',
        '',
        ''
      ]);

      dados.push([
        'Total',
        '50.450.472430000',
        '',
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.valorPrincipal),
        '',
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.valorBruto),
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.rendaTotal),
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.iof),
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.irrf),
        this.formatarMoeda(rendaFixa.saldoAteriorTotal.valoLiquido),
        '',
        '',
        ''
      ]);
    }

    // Aplicações - usando dados do RENDA_FIXA_DATA
    dados.push(['', 'Aplicações', '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.aplicacao && rendaFixa.aplicacao.length > 0) {
      rendaFixa.aplicacao.forEach(aplicacao => {
        dados.push([
          this.formatarData(this.converterDataBrasileira(aplicacao.dataAplicacao)),
          '',
          '',
          this.formatarMoeda(aplicacao.valorPrincipal),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ]);
      });
    }
    
    dados.push([
      'Total',
      '',
      '',
      this.formatarMoeda(rendaFixa.aplicacaoTotal.valorPrincipal),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ]);

    // Resgates/Vencimentos - usando dados do RENDA_FIXA_DATA
    dados.push(['', 'Resgates/Vencimentos', '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.resgate && rendaFixa.resgate.length > 0) {
      rendaFixa.resgate.forEach(resgate => {
        dados.push([
          this.formatarData(this.converterDataBrasileira(resgate.dataAplicacao)),
          '',
          '',
          this.formatarMoeda(resgate.valorPrincipal),
          '',
          this.formatarMoeda(resgate.valorBruto),
          this.formatarMoeda(resgate.rendaTotal),
          this.formatarMoeda(resgate.iof),
          this.formatarMoeda(resgate.irrf),
          this.formatarMoeda(resgate.valoLiquido),
          '',
          '',
          ''
        ]);
      });
    }
    
    dados.push([
      'Total',
      '',
      '',
      this.formatarMoeda(rendaFixa.resgateTotal.valorPrincipal),
      '',
      this.formatarMoeda(rendaFixa.resgateTotal.valorBruto),
      this.formatarMoeda(rendaFixa.resgateTotal.rendaTotal),
      this.formatarMoeda(rendaFixa.resgateTotal.iof),
      this.formatarMoeda(rendaFixa.resgateTotal.irrf),
      this.formatarMoeda(rendaFixa.resgateTotal.valoLiquido),
      '',
      '',
      ''
    ]);

    // Redução de cotas - não há dados no mock, mantendo zerado
    dados.push(['', 'Redução de cotas - Recolhimento de IR conforme legislação vigente', '', '', '', '', '', '', '', '', '', '', '']);
    
    dados.push([
      'Total',
      '',
      '',
      '0,00',
      '',
      '0,00',
      '0,00',
      '0,00',
      '0,00',
      '0,00',
      '',
      '',
      ''
    ]);

    // Saldo final - usando dados do RENDA_FIXA_DATA
    const dataSaldoFinal = this.formatarData(this.converterDataBrasileira(rendaFixa.dataSaldoFinal));
    dados.push(['', `Saldo final em ${dataSaldoFinal}`, '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.saldoFinal && rendaFixa.saldoFinal.length > 0) {
      const saldoFin = rendaFixa.saldoFinal[0];
      dados.push([
        this.formatarData(this.converterDataBrasileira(saldoFin.dataAplicacao)),
        '50.450.472430000',
        '',
        this.formatarMoeda(rendaFixa.saldoFinalTotal.valorPrincipal),
        '668052000',
        this.formatarMoeda(saldoFin.valorBruto),
        this.formatarMoeda(saldoFin.rendaTotal),
        this.formatarMoeda(saldoFin.iof),
        this.formatarMoeda(saldoFin.irrf),
        this.formatarMoeda(saldoFin.valoLiquido),
        this.formatarMoeda(saldoFin.rendaBruta),
        '',
        ''
      ]);

      dados.push([
        'Total',
        '50.450.472430000',
        '',
        this.formatarMoeda(rendaFixa.saldoFinalTotal.valorPrincipal),
        '',
        this.formatarMoeda(rendaFixa.saldoFinalTotal.valorBruto),
        this.formatarMoeda(rendaFixa.saldoFinalTotal.rendaTotal),
        this.formatarMoeda(rendaFixa.saldoFinalTotal.iof),
        this.formatarMoeda(rendaFixa.saldoFinalTotal.irrf),
        this.formatarMoeda(rendaFixa.saldoFinalTotal.valoLiquido),
        this.formatarMoeda(rendaFixa.saldoFinalTotal.rendaBruta),
        '',
        ''
      ]);
    }

    return dados;
  }

  /**
   * Aplica formatação com cores usando xlsx-js-style
   */
  private aplicarFormatacaoXLSComCores(worksheet: any, dados: any[][]): void {
    // Definir largura das colunas
    const colWidths = [
      { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 13 },
      { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 5 }, { wch: 5 }
    ];
    worksheet['!cols'] = colWidths;

    // Aplicar estilos com cores usando xlsx-js-style
    for (let row = 0; row < dados.length; row++) {
      for (let col = 0; col < dados[row].length; col++) {
        const cellAddress = XLSXStyle.utils.encode_cell({ r: row, c: col });
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: dados[row][col] };
        }

        // Header Bradesco (linhas 0-1, colunas A-B) - Azul escuro como na imagem
        if (row <= 1 && col <= 1) {
          worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: '003366' } },
            font: { 
              color: { rgb: 'FFFFFF' }, 
              bold: true, 
              sz: row === 0 ? 14 : 12 
            },
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        }
        // Título principal (linha 7) - Centralizado na coluna A como na imagem
        else if (row === 7) {
          if (col === 0) {
            worksheet[cellAddress].s = {
              font: { bold: true, sz: 14 },
              alignment: { horizontal: 'left', vertical: 'center' }
            };
          }
        }
        // Data da transação (linha 8) - Alinhamento correto
        else if (row === 8) {
          if (col === 0) {
            worksheet[cellAddress].s = {
              font: { bold: false, sz: 11 },
              alignment: { horizontal: 'left', vertical: 'center' }
            };
          } else if (col === 1) {
            worksheet[cellAddress].s = {
              font: { bold: false, sz: 11 },
              alignment: { horizontal: 'left', vertical: 'center' }
            };
          }
        }
        // Detalhes da Pesquisa (linha 10) - Cinza claro como na imagem
        else if (row === 10) {
          worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'E8E8E8' } },
            font: { bold: true, sz: 11 }
          };
        }
        // Header da tabela (linha 16) - Cinza prata como na imagem
        else if (row === 16) {
          worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'C0C0C0' } },
            font: { bold: true, sz: 11 },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
        // Títulos das seções (coluna A) - Sem fundo como na imagem
        else if (col === 0 && (row === 17 || row === 20 || row === 22 || row === 24 || row === 26)) {
          worksheet[cellAddress].s = {
            font: { bold: true, sz: 11 }
          };
        }
        // Títulos das seções - Negrito e alinhado à esquerda na coluna B (PRIORIDADE)
        else if (col === 1 && (dados[row][col].includes('Saldo anterior em') || 
                               dados[row][col] === 'Aplicações' || 
                               dados[row][col] === 'Resgates/Vencimentos' || 
                               dados[row][col] === 'Redução de cotas - Recolhimento de IR conforme legislação vigente' ||
                               dados[row][col].includes('Saldo final em'))) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        }
        // Valores monetários - Alinhados à direita como na imagem (exceto títulos de seções)
        else if ([1, 3, 4, 5, 6, 7, 8, 9].includes(col) && dados[row][col] !== '' && 
                 !(col === 1 && (dados[row][col].includes('Saldo anterior em') || 
                                 dados[row][col] === 'Aplicações' || 
                                 dados[row][col] === 'Resgates/Vencimentos' || 
                                 dados[row][col] === 'Redução de cotas - Recolhimento de IR conforme legislação vigente' ||
                                 dados[row][col].includes('Saldo final em')))) {
          worksheet[cellAddress].s = {
            alignment: { horizontal: 'right' }
          };
        }
        // Totais - Negrito
        else if (dados[row][0] === 'Total') {
          worksheet[cellAddress].s = {
            font: { bold: true }
          };
        }
      }
    }

    // Mesclagens - replicando exatamente a estrutura da imagem
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    
    // Header Bradesco - mesclado apenas até coluna B como na imagem
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
    worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });
    
    // Saldo e Extrato - sem mesclagem para ficar claramente na coluna A
    // Removido mesclagem para manter o texto apenas na coluna A
    
    // Data da transação - sem mesclagem (A: label, B: data)
    // Não precisa de mesclagem pois são células individuais
    
    // Detalhes da Pesquisa
    worksheet['!merges'].push({ s: { r: 10, c: 0 }, e: { r: 10, c: 12 } });

    // Títulos das seções - mesclando da coluna B até M (dinâmico)
    for (let row = 0; row < dados.length; row++) {
      if (dados[row][1] && (
        dados[row][1].includes('Saldo anterior em') ||
        dados[row][1] === 'Aplicações' ||
        dados[row][1] === 'Resgates/Vencimentos' ||
        dados[row][1] === 'Redução de cotas - Recolhimento de IR conforme legislação vigente' ||
        dados[row][1].includes('Saldo final em')
      )) {
        worksheet['!merges'].push({ s: { r: row, c: 1 }, e: { r: row, c: 12 } });
      }
    }

    // Range do worksheet
    const range = XLSXStyle.utils.decode_range(worksheet['!ref'] || 'A1');
    range.e.c = Math.max(range.e.c, 12);
    range.e.r = Math.max(range.e.r, dados.length - 1);
    worksheet['!ref'] = XLSXStyle.utils.encode_range(range);
  }


}
