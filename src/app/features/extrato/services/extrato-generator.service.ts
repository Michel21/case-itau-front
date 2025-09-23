import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WebViewDownloadService } from '../../../shared/services/webview-download.service';
import { ExtratoDados, RendaFixaData } from '../../../../../types/extrato.types';
import { RENDA_FIXA_DATA } from '../../../../../data/mock-extrato.data';

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
  format?: 'pdf' | 'csv' | 'html';
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
  private readonly webViewDownloadService = new WebViewDownloadService();

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
      
      // Gerar HTML do extrato
      const htmlContent = this.gerarHTMLDoExtrato(extratoData, config, options);
      
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
   * Gera HTML do extrato
   */
  async gerarHTML(
    extratoData: ExtratoSimples,
    config: ExtratoConfig,
    options: GeracaoOptions = {}
  ): Promise<boolean> {
    try {
      const fileName = options.fileName || `extrato-${this.formatarData(config.dataGeracao)}.html`;
      
      // Gerar HTML do extrato
      const htmlContent = this.gerarHTMLDoExtrato(extratoData, config, options);
      
      // Download
      return await this.webViewDownloadService.downloadHTML(htmlContent, fileName);

    } catch (error) {
      return false;
    }
  }

  /**
   * Gera HTML do extrato
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
   * Gera CSS para o extrato (replicando o layout do ExtratoPdfComponent)
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
        background: #001e61 !important;
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
    return `
      <section class="table-section">
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr class="table-header">
                <th>Data aplic.</th>
                <th>Data vencto.</th>
                <th>Resgate/Carência</th>
                <th>Taxa (%)</th>
                <th>Valor princ. (BRL)</th>
                <th>Valor Bruto (BRL)</th>
                <th>Renda total (BRL)</th>
                <th>IOF (BRL)</th>
                <th>IRRF (BRL)</th>
                <th>Valor Líquido (BRL)</th>
                <th>Renda bruta per</th>
              </tr>
            </thead>
            <tbody>
              ${this.gerarSecaoSaldoAnteriorDados()}
              ${this.gerarSecaoAplicacoesDados()}
              ${this.gerarHeaderRepetido()}
              ${this.gerarSecaoResgatesDados()}
              ${this.gerarSecaoSaldoFinalDados()}
            </tbody>
          </table>
        </div>
      </section>
    `;
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
    return `
      <tr class="table-header">
        <th>Data aplic.</th>
        <th>Data vencto.</th>
        <th>Resgate/Carência</th>
        <th>Taxa (%)</th>
        <th>Valor princ. (BRL)</th>
        <th>Valor Bruto (BRL)</th>
        <th>Renda total (BRL)</th>
        <th>IOF (BRL)</th>
        <th>IRRF (BRL)</th>
        <th>Valor Líquido (BRL)</th>
        <th>Renda bruta per</th>
      </tr>
    `;
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
   * Gera seção de saldo anterior (exatamente como na imagem)
   */
  private gerarSecaoSaldoAnterior(): string {
    return `
      <section class="table-section">
        <h3>Saldo anterior em 31/07/2025</h3>
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr>
                <th>Data aplic.</th>
                <th>Data vencto.</th>
                <th>Resgate/Carência</th>
                <th>Taxa (%)</th>
                <th>Valor princ. (BRL)</th>
                <th>Valor Bruto (BRL)</th>
                <th>Renda total (BRL)</th>
                <th>IOF (BRL)</th>
                <th>IRRF (BRL)</th>
                <th>Valor Líquido (BRL)</th>
                <th>Renda bruta per</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10/03/2025</td>
                <td>01/03/2027</td>
                <td></td>
                <td></td>
                <td class="text-right">58,22</td>
                <td class="text-right">58,37</td>
                <td class="text-right">0,15</td>
                <td class="text-right">0,00</td>
                <td class="text-right">0,03</td>
                <td class="text-right">58,34</td>
                <td class="text-right"></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4"><strong>Total</strong></td>
                <td class="text-right"><strong>1.153,74</strong></td>
                <td class="text-right"><strong>1.154,17</strong></td>
                <td class="text-right"><strong>0,43</strong></td>
                <td class="text-right"><strong>0,00</strong></td>
                <td class="text-right"><strong>0,36</strong></td>
                <td class="text-right"><strong>1.063,45</strong></td>
                <td class="text-right"><strong></strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    `;
  }

  /**
   * Gera seção de aplicações (exatamente como na imagem)
   */
  private gerarSecaoAplicacoes(): string {
    return `
      <section class="table-section">
        <h3>Aplicações</h3>
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr>
                <th>Data aplic.</th>
                <th>Data vencto.</th>
                <th>Resgate/Carência</th>
                <th>Taxa (%)</th>
                <th>Valor princ. (BRL)</th>
                <th>Valor Bruto (BRL)</th>
                <th>Renda total (BRL)</th>
                <th>IOF (BRL)</th>
                <th>IRRF (BRL)</th>
                <th>Valor Líquido (BRL)</th>
                <th>Renda bruta per</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>04/08/2025</td>
                <td>26/07/2027</td>
                <td></td>
                <td></td>
                <td class="text-right">850,00</td>
                <td class="text-right">750,00</td>
                <td class="text-right">0,00</td>
                <td class="text-right">0,00</td>
                <td class="text-right">0,00</td>
                <td class="text-right">750,00</td>
                <td class="text-right"></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4"><strong>Total</strong></td>
                <td class="text-right"><strong>850,00</strong></td>
                <td class="text-right"><strong>750,00</strong></td>
                <td class="text-right"><strong>0,00</strong></td>
                <td class="text-right"><strong>0,00</strong></td>
                <td class="text-right"><strong>0,00</strong></td>
                <td class="text-right"><strong>750,00</strong></td>
                <td class="text-right"><strong></strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      
      <!-- Separador visual como na imagem -->
      <div style="height: 20px; background: #000; margin: 20px 0;"></div>
    `;
  }

  /**
   * Gera seção de resgates (exatamente como na imagem)
   */
  private gerarSecaoResgates(): string {
    return `
      <section class="table-section">
        <h3>Resgates/Vencimentos</h3>
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr>
                <th>Data aplic.</th>
                <th>Data vencto.</th>
                <th>Resgate/Carência</th>
                <th>Taxa (%)</th>
                <th>Valor princ. (BRL)</th>
                <th>Valor Bruto (BRL)</th>
                <th>Renda total (BRL)</th>
                <th>IOF (BRL)</th>
                <th>IRRF (BRL)</th>
                <th>Valor Líquido (BRL)</th>
                <th>Renda bruta per</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10/03/2025</td>
                <td>01/03/2027</td>
                <td>05/08/2025</td>
                <td class="text-right">5,00</td>
                <td class="text-right">58,22</td>
                <td class="text-right">58,37</td>
                <td class="text-right">0,15</td>
                <td class="text-right">0,00</td>
                <td class="text-right">0,03</td>
                <td class="text-right">58,34</td>
                <td class="text-right">0,00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4"><strong>Total</strong></td>
                <td class="text-right"><strong>932,09</strong></td>
                <td class="text-right"><strong>932,91</strong></td>
                <td class="text-right"><strong>0,82</strong></td>
                <td class="text-right"><strong>0,00</strong></td>
                <td class="text-right"><strong>0,18</strong></td>
                <td class="text-right"><strong>932,73</strong></td>
                <td class="text-right"><strong>0,09</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    `;
  }

  /**
   * Gera seção de saldo final (exatamente como na imagem)
   */
  private gerarSecaoSaldoFinal(): string {
    return `
      <section class="table-section">
        <h3>Saldo final em 25/08/2025</h3>
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr>
                <th>Data aplic.</th>
                <th>Data vencto.</th>
                <th>Resgate/Carência</th>
                <th>Taxa (%)</th>
                <th>Valor princ. (BRL)</th>
                <th>Valor Bruto (BRL)</th>
                <th>Renda total (BRL)</th>
                <th>IOF (BRL)</th>
                <th>IRRF (BRL)</th>
                <th>Valor Líquido (BRL)</th>
                <th>Renda bruta per</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>28/08/2025</td>
                <td>07/06/2027</td>
                <td></td>
                <td class="text-right">5,00</td>
                <td class="text-right">44,56</td>
                <td class="text-right">44,61</td>
                <td class="text-right">0,05</td>
                <td class="text-right">0,00</td>
                <td class="text-right">0,01</td>
                <td class="text-right">44,60</td>
                <td class="text-right">0,02</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4"><strong>Total</strong></td>
                <td class="text-right"><strong>194,56</strong></td>
                <td class="text-right"><strong>194,61</strong></td>
                <td class="text-right"><strong>0,05</strong></td>
                <td class="text-right"><strong>0,00</strong></td>
                <td class="text-right"><strong>0,01</strong></td>
                <td class="text-right"><strong>194,60</strong></td>
                <td class="text-right"><strong>0,02</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    `;
  }

  /**
   * Gera seção de itens (replicando a tabela financeira do Bradesco)
   */
  private gerarSecaoItens(itens: ExtratoItemSimples[]): string {
    let html = `
      <section class="table-section">
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr>
                <th>Data Aplicação</th>
                <th>Data Vencimento</th>
                <th>Taxa</th>
                <th>Valor Principal</th>
                <th>Valor Bruto</th>
                <th>Renda Total</th>
                <th>IOF</th>
                <th>IRRF</th>
                <th>Valor Líquido</th>
                <th>Renda Bruta %</th>
                <th>Renda Bruta</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Adicionar itens
    itens.forEach(item => {
      html += '<tr>';
      html += `<td>${item.data || ''}</td>`;
      html += `<td>${item.data || ''}</td>`; // Data vencimento (usando data como exemplo)
      html += `<td class="text-right">5,00%</td>`;
      html += `<td class="text-right">${this.formatarMoeda(item.valor || 0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda((item.valor || 0) * 1.001)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(0.01)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda((item.valor || 0) * 0.999)}</td>`;
      html += `<td class="text-right">0,02%</td>`;
      html += `<td class="text-right">${this.formatarMoeda(0.02)}</td>`;
      html += '</tr>';
    });
    
    // Linha de total
    const totalPrincipal = itens.reduce((sum, item) => sum + (item.valor || 0), 0);
    const totalBruto = totalPrincipal * 1.001;
    const totalLiquido = totalPrincipal * 0.999;
    
    html += `
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(totalPrincipal)}</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(totalBruto)}</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(0)}</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(0)}</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(0.01)}</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(totalLiquido)}</strong></td>
                <td class="text-right"><strong>0,02%</strong></td>
                <td class="text-right"><strong>${this.formatarMoeda(0.02)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    `;

    return html;
  }

  /**
   * Gera seção de renda fixa
   */
  private gerarSecaoRendaFixa(rendaFixa: any): string {
    let html = '<div class="section"><h2>Renda Fixa</h2>';
    
    if (rendaFixa?.saldoAnterior && rendaFixa.saldoAnterior.length > 0) {
      html += this.gerarTabelaRendaFixa('Saldo Anterior', rendaFixa.saldoAnterior);
    }
    
    if (rendaFixa?.aplicacao && rendaFixa.aplicacao.length > 0) {
      html += this.gerarTabelaRendaFixa('Aplicações', rendaFixa.aplicacao);
    }
    
    if (rendaFixa?.resgate && rendaFixa.resgate.length > 0) {
      html += this.gerarTabelaRendaFixa('Resgates', rendaFixa.resgate);
    }
    
    if (rendaFixa?.saldoFinal && rendaFixa.saldoFinal.length > 0) {
      html += this.gerarTabelaRendaFixa('Saldo Final', rendaFixa.saldoFinal);
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Gera tabela de renda fixa
   */
  private gerarTabelaRendaFixa(titulo: string, itens: any[]): string {
    if (!itens || itens.length === 0) return '';

    let html = `<h3>${titulo}</h3><table>`;
    
    // Header
    html += '<thead><tr>';
    html += '<th>Data Aplicação</th>';
    html += '<th>Data Vencimento</th>';
    html += '<th>Taxa</th>';
    html += '<th>Valor Principal</th>';
    html += '<th>Valor Bruto</th>';
    html += '<th>Renda Total</th>';
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    itens.forEach(item => {
      html += '<tr>';
      html += `<td>${item.dataAplicacao || ''}</td>`;
      html += `<td>${item.dataVencimento || ''}</td>`;
      html += `<td class="text-right">${this.formatarPercentual(item.taxa || 0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(item.valorPrincipal || 0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(item.valorBruto || 0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(item.rendaTotal || 0)}</td>`;
      html += '</tr>';
    });
    html += '</tbody></table>';

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
    
    // Header do CSV
    csv += 'Data,Descrição,Valor,Saldo\n';
    
    // Itens do extrato
    if (extratoData.itens && extratoData.itens.length > 0) {
      extratoData.itens.forEach((item: any) => {
        csv += `"${item.data || ''}","${item.descricao || ''}","${this.formatarMoeda(item.valor || 0)}","${this.formatarMoeda(item.saldo || 0)}"\n`;
      });
    }
    
    return csv;
  }

  /**
   * Cria elemento temporário para renderização
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
   * Formata moeda
   */
  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  /**
   * Formata data
   */
  private formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }

  /**
   * Formata data e hora
   */
  private formatarDataHora(data: Date): string {
    return data.toLocaleString('pt-BR');
  }

  /**
   * Formata percentual
   */
  private formatarPercentual(valor: number): string {
    return valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + '%';
  }

  /**
   * Formata hora
   */
  private formatarHora(data: Date): string {
    return data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
}
