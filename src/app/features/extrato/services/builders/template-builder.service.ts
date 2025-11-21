import { Injectable } from '@angular/core';
import { ITemplateBuilder, DocumentConfig, ExtratoData } from '../interfaces/extrato-generator-clean.interfaces';
import { DataFormatterService } from '../formatters/data-formatter.service';

/**
 * Serviço responsável exclusivamente por construção de templates HTML
 * Segue o Single Responsibility Principle (SRP)
 */
@Injectable({
  providedIn: 'root'
})
export class TemplateBuilderService implements ITemplateBuilder {

  constructor(private readonly dataFormatter: DataFormatterService) {}

  /**
   * Constrói template do cabeçalho
   */
  buildHeaderTemplate(config: DocumentConfig): string {
    const dataFormatada = this.dataFormatter.formatDate(config.dataGeracao);
    const horaFormatada = this.dataFormatter.formatDateTime(config.dataGeracao);

    return `
      <div class="header-extrato">
        <div class="logo-section">
          <h1 class="empresa-nome">${this.escapeHtml(config.empresa)}</h1>
          <h2 class="documento-titulo">${this.escapeHtml(config.titulo)}</h2>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Agência:</span>
            <span class="value">${this.escapeHtml(config.agencia)}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Conta:</span>
            <span class="value">${this.escapeHtml(config.conta)}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Período:</span>
            <span class="value">${this.escapeHtml(config.periodo)}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Data de Geração:</span>
            <span class="value">${dataFormatada}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Hora de Geração:</span>
            <span class="value">${horaFormatada}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Número de Controle:</span>
            <span class="value">${this.escapeHtml(config.numeroControle)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Constrói template da tabela de dados
   */
  buildTableTemplate(data: ExtratoData): string {
    const tableRows = this.buildTableRows(data);
    
    return `
      <div class="table-container">
        <table class="extrato-table">
          <thead>
            <tr class="table-header">
              <th class="col-data">Data</th>
              <th class="col-descricao">Descrição</th>
              <th class="col-valor">Valor</th>
              <th class="col-saldo">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Constrói template do rodapé
   */
  buildFooterTemplate(config: DocumentConfig): string {
    const dataGeracao = this.dataFormatter.formatDateTime(config.dataGeracao);
    
    return `
      <div class="footer-extrato">
        <div class="footer-info">
          <p class="footer-text">
            Documento gerado em ${dataGeracao}
          </p>
          <p class="footer-text">
            ${this.escapeHtml(config.empresa)} - Todos os direitos reservados
          </p>
          <p class="footer-control">
            Controle: ${this.escapeHtml(config.numeroControle)}
          </p>
        </div>
        
        <div class="footer-disclaimer">
          <p class="disclaimer-text">
            Este documento foi gerado automaticamente e possui validade legal.
            Em caso de dúvidas, entre em contato com nossa central de atendimento.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Constrói template completo combinando todas as seções
   */
  buildCompleteTemplate(data: ExtratoData, config: DocumentConfig): string {
    const styles = this.buildStylesheet();
    const header = this.buildHeaderTemplate(config);
    const table = this.buildTableTemplate(data);
    const footer = this.buildFooterTemplate(config);
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${this.escapeHtml(config.titulo)}</title>
          ${styles}
        </head>
        <body>
          <div class="document-container">
            ${header}
            ${table}
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  // ============================================================================
  // MÉTODOS PRIVADOS (Clean Code: funções pequenas e focadas)
  // ============================================================================

  /**
   * Constrói as linhas da tabela de dados
   */
  private buildTableRows(data: ExtratoData): string {
    if (!data.itens || data.itens.length === 0) {
      return this.buildEmptyTableRow();
    }

    return data.itens
      .map((item, index) => this.buildSingleTableRow(item, index))
      .join('');
  }

  /**
   * Constrói uma única linha da tabela
   */
  private buildSingleTableRow(item: any, index: number): string {
    const dataFormatada = this.dataFormatter.formatDate(item.data);
    const valorFormatado = this.dataFormatter.formatCurrency(item.valor);
    const saldoFormatado = this.dataFormatter.formatCurrency(item.saldo);
    const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
    const valorClass = item.valor >= 0 ? 'valor-positivo' : 'valor-negativo';
    
    return `
      <tr class="table-row ${rowClass}">
        <td class="col-data">${dataFormatada}</td>
        <td class="col-descricao">${this.escapeHtml(item.descricao)}</td>
        <td class="col-valor ${valorClass}">${valorFormatado}</td>
        <td class="col-saldo">${saldoFormatado}</td>
      </tr>
    `;
  }

  /**
   * Constrói linha para tabela vazia
   */
  private buildEmptyTableRow(): string {
    return `
      <tr class="table-row empty-row">
        <td colspan="4" class="empty-message">
          Nenhum registro encontrado para o período selecionado
        </td>
      </tr>
    `;
  }

  /**
   * Constrói stylesheet CSS para o documento
   */
  private buildStylesheet(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background-color: #fff;
        }
        
        .document-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header Styles */
        .header-extrato {
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .logo-section {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .empresa-nome {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 5px;
        }
        
        .documento-titulo {
          font-size: 18px;
          color: #666;
          font-weight: normal;
        }
        
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        
        .info-row .label {
          font-weight: bold;
          color: #333;
        }
        
        .info-row .value {
          color: #666;
        }
        
        /* Table Styles */
        .table-container {
          margin: 30px 0;
          overflow-x: auto;
        }
        
        .extrato-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
        }
        
        .table-header {
          background-color: #0066cc;
          color: white;
        }
        
        .table-header th {
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
        }
        
        .table-row {
          border-bottom: 1px solid #eee;
        }
        
        .row-even {
          background-color: #f9f9f9;
        }
        
        .row-odd {
          background-color: #fff;
        }
        
        .table-row td {
          padding: 10px 8px;
          font-size: 12px;
        }
        
        .col-data {
          width: 12%;
          text-align: center;
        }
        
        .col-descricao {
          width: 50%;
        }
        
        .col-valor, .col-saldo {
          width: 19%;
          text-align: right;
          font-family: 'Courier New', monospace;
        }
        
        .valor-positivo {
          color: #008000;
        }
        
        .valor-negativo {
          color: #cc0000;
        }
        
        .empty-message {
          text-align: center;
          font-style: italic;
          color: #999;
          padding: 40px;
        }
        
        /* Footer Styles */
        .footer-extrato {
          border-top: 2px solid #eee;
          padding-top: 20px;
          margin-top: 40px;
        }
        
        .footer-info {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .footer-text {
          margin: 5px 0;
          color: #666;
          font-size: 11px;
        }
        
        .footer-control {
          margin: 10px 0;
          font-weight: bold;
          color: #333;
          font-size: 10px;
        }
        
        .footer-disclaimer {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
        }
        
        .disclaimer-text {
          font-size: 10px;
          color: #666;
          text-align: justify;
          line-height: 1.5;
        }
        
        /* Print Styles */
        @media print {
          .document-container {
            max-width: none;
            padding: 0;
          }
          
          .table-container {
            page-break-inside: avoid;
          }
          
          .footer-extrato {
            page-break-inside: avoid;
          }
        }
      </style>
    `;
  }

  /**
   * Escapa caracteres HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
