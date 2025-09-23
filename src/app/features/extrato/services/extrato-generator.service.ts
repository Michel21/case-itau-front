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
      const fileName = options.fileName || `extrato-${this.formatarData(config.dataGeracao)}.pdf`;
      
      // Gerar HTML do extrato
      const htmlContent = this.gerarHTMLDoExtrato(extratoData, config, options);
      
      // Criar elemento temporário
      const tempElement = this.criarElementoTemporario(htmlContent);
      document.body.appendChild(tempElement);

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capturar com html2canvas
      const canvas = await html2canvas(tempElement, {
        scale: options.quality === 'high' ? 3 : options.quality === 'medium' ? 2 : 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000,
        height: tempElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000,
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
        line-height: 1.4;
        color: #000;
        background: #fff;
      }
      
      .extrato-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        background: #fff;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #000;
        padding-bottom: 20px;
      }
      
      .header h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .header-info {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
      }
      
      .header-info div {
        flex: 1;
        text-align: left;
      }
      
      .header-info div:last-child {
        text-align: right;
      }
      
      .section {
        margin-bottom: 30px;
      }
      
      .section h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      th, td {
        padding: 8px;
        text-align: left;
        border: 1px solid #ccc;
        font-size: 11px;
      }
      
      th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-center {
        text-align: center;
      }
      
      .total {
        font-weight: bold;
        background-color: #f0f0f0;
      }
      
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 15px;
      }
      
      @media print {
        body { margin: 0; }
        .extrato-container { margin: 0; padding: 10px; }
      }
    `;
  }

  /**
   * Gera header do extrato
   */
  private gerarHeader(config: ExtratoConfig): string {
    return `
      <div class="header">
        <h1>${config.titulo}</h1>
        <div class="header-info">
          <div>
            <strong>Empresa:</strong> ${config.empresa}<br>
            <strong>Agência:</strong> ${config.agencia}<br>
            <strong>Conta:</strong> ${config.conta}
          </div>
          <div>
            <strong>Período:</strong> ${config.periodo}<br>
            <strong>Data de Geração:</strong> ${this.formatarData(config.dataGeracao)}<br>
            <strong>Número de Controle:</strong> ${config.numeroControle}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gera body do extrato
   */
  private gerarBody(extratoData: ExtratoSimples, config: ExtratoConfig, options: GeracaoOptions): string {
    let body = '';

    // Seção de itens do extrato
    if (extratoData.itens && extratoData.itens.length > 0) {
      body += this.gerarSecaoItens(extratoData.itens);
    }

    // Seção de renda fixa (se habilitada)
    if (options.includeRendaFixa) {
      body += this.gerarSecaoRendaFixa(RENDA_FIXA_DATA.rendaFixa);
    }

    return `<div class="extrato-container">${body}</div>`;
  }

  /**
   * Gera seção de itens
   */
  private gerarSecaoItens(itens: ExtratoItemSimples[]): string {
    let html = '<div class="section"><h2>Extrato de Movimentações</h2><table>';
    
    // Header da tabela
    html += '<thead><tr>';
    html += '<th>Data</th>';
    html += '<th>Descrição</th>';
    html += '<th>Valor</th>';
    html += '<th>Saldo</th>';
    html += '</tr></thead>';
    
    // Body da tabela
    html += '<tbody>';
    itens.forEach(item => {
      html += '<tr>';
      html += `<td>${item.data || ''}</td>`;
      html += `<td>${item.descricao || ''}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(item.valor || 0)}</td>`;
      html += `<td class="text-right">${this.formatarMoeda(item.saldo || 0)}</td>`;
      html += '</tr>';
    });
    html += '</tbody></table></div>';

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
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '1000px';
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
    tempDiv.style.transform = 'none';
    tempDiv.style.transformOrigin = 'top left';
    
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
}
