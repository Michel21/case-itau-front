import { Injectable } from '@angular/core';
import { ExtratoDados } from './types/extrato.types';

export interface PDFConfig {
  title: string;
  subtitle: string;
  dataTransacao: string;
  numeroControle: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExtratoPdfService {

  private readonly BRAND_NAME = 'BRADESCO CORPORATE';
  private readonly BRAND_SUBTITLE = 'Global Solutions';

  constructor() { }

  criarConfigPDF(dataTransacao: string, numeroControle: string): PDFConfig {
    return {
      title: this.BRAND_NAME,
      subtitle: this.BRAND_SUBTITLE,
      dataTransacao,
      numeroControle,
      fileName: `extrato_bradesco_${dataTransacao.replace(/\//g, '')}.pdf`
    };
  }

  async gerarPDFCorporativo(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    try {
      // Fallback para impressão
      this.gerarPDFPrintCorporativo(dados, config);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.gerarPDFPrintCorporativo(dados, config);
    }
  }

  gerarPDFPrint(): void {
    window.print();
  }

  gerarCSV(dados: ExtratoDados, config: PDFConfig): void {
    const BOM = '\uFEFF';
    const csvContent = BOM + this.converterParaCSV(dados);
    this.downloadFile(csvContent, config.fileName.replace('.pdf', '.csv'), 'text/csv;charset=utf-8;');
  }

  exportarHTML(dados: ExtratoDados, config: PDFConfig): void {
    const htmlContent = this.gerarHTMLCorporativo(dados, config);
    this.downloadFile(htmlContent, config.fileName.replace('.pdf', '.html'), 'text/html');
  }

  private gerarPDFPrintCorporativo(dados: ExtratoDados, config: PDFConfig): void {
    const htmlContent = this.gerarHTMLCorporativo(dados, config);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  }

  private converterParaCSV(dados: ExtratoDados): string {
    let csv = 'Seção,Data Aplica,Data Vencir,Data Resgal,Taxa (%),Valor Princi,Valor Bruto,Renda Tota,IOF (BRL),IRRF (BRL),Valor Líquic,Renda Bruta Per (BRL)\n';

    if (dados.saldoAnterior?.itens) {
      csv += `Saldo anterior em ${dados.saldoAnterior.dataSaldo}\n`;
      dados.saldoAnterior.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Saldo Anter', item);
      });
      csv += this.totaisParaCSVSimples('Saldo Anterior - TOTAL', dados.saldoAnterior);
    }

    if (dados.aplicacoes?.itens) {
      csv += 'Aplicações\n';
      dados.aplicacoes.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Aplicações', item);
      });
      csv += this.totaisParaCSVSimples('Aplicações - TOTAL', dados.aplicacoes);
    }

    if (dados.resgates?.itens) {
      csv += 'Resgates/Vencimentos\n';
      dados.resgates.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Resgates', item);
      });
      csv += this.totaisParaCSVSimples('Resgates - TOTAL', dados.resgates);
    }

    if (dados.saldoFinal?.itens) {
      csv += `Saldo final em ${dados.saldoFinal.dataSaldo}\n`;
      dados.saldoFinal.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Saldo Final', item);
      });
      csv += this.totaisParaCSVSimples('Saldo Final - TOTAL', dados.saldoFinal);
    }

    return csv;
  }

  private itemParaCSVSimples(secao: string, item: any): string {
    return `${secao},########,########,########,${item.taxa || ''},${this.formatarMoeda(item.valorPrincipal)},${this.formatarMoeda(item.valorBruto)},${this.formatarMoeda(item.rendaTotal)},${this.formatarMoeda(item.iof)},${this.formatarMoeda(item.irrf)},${this.formatarMoeda(item.valorLiquido)},${this.formatarMoeda(item.rendaBrutaPer)}\n`;
  }

  private totaisParaCSVSimples(secao: string, dados: any): string {
    return `${secao},,,,,${this.formatarMoeda(dados.totalValorPrincipal)},${this.formatarMoeda(dados.totalValorBruto)},${this.formatarMoeda(dados.totalRendaTotal)},${this.formatarMoeda(dados.totalIof)},${this.formatarMoeda(dados.totalIrrf)},${this.formatarMoeda(dados.totalValorLiquido)},${this.formatarMoeda(dados.totalRendaBrutaPer)}\n`;
  }

  private gerarHTMLCorporativo(dados: ExtratoDados, config: PDFConfig): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Extrato Bancário</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #ffffff;
        color: #000;
        line-height: 1.3;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
        padding-bottom: 15px;
      }
      .header-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #cc0000;
        margin-bottom: 2px;
      }
      .subtitle {
        font-size: 16px;
        color: #000;
        margin-bottom: 4px;
        font-weight: normal;
      }
      .global-solutions {
        font-size: 12px;
        color: #ffffff;
        background-color: #000;
        padding: 4px 8px;
        border-radius: 2px;
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
        color: #000;
        margin-bottom: 8px;
      }
      .transaction-details {
        font-size: 12px;
        color: #000;
        line-height: 1.4;
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
        border-bottom: 1px solid #ccc;
      }
      .financial-table td {
        padding: 6px 4px;
        text-align: center;
        border: none;
        color: #000;
        font-size: 11px;
        border-bottom: 1px solid #eee;
      }
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
      .financial-table td:nth-child(5),
      .financial-table th:nth-child(6),
      .financial-table td:nth-child(6),
      .financial-table th:nth-child(7),
      .financial-table td:nth-child(7),
      .financial-table th:nth-child(8),
      .financial-table td:nth-child(8),
      .financial-table th:nth-child(9),
      .financial-table td:nth-child(9),
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
        border-bottom: 1px solid #ddd;
      }
      .data-row {
        background-color: transparent;
      }
      .total-row {
        background-color: transparent !important;
        color: #000 !important;
        font-weight: bold;
        border-top: 1px solid #ddd !important;
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
        padding-left: 20px !important;
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
      @media print {
        body { margin: 0; }
        .action-buttons { display: none !important; }
      }
    </style>
</head>
<body>
    <div class="header">
      <div class="header-left">
        <div class="logo">bradesco</div>
        <div class="subtitle">corporate</div>
        <div class="global-solutions">global solutions</div>
      </div>
      <div class="header-right">
        <div class="report-title">Saldo e extrato</div>
        <div class="transaction-details">
          <div>Data da transação: ${config.dataTransacao} - ${new Date().toLocaleTimeString('pt-BR')}</div>
          <div>Número de controle: ${config.numeroControle}</div>
        </div>
      </div>
    </div>

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
        ${this.gerarHTMLSecao('SALDO ANTERIOR', dados.saldoAnterior)}
        ${this.gerarHTMLSecao('APLICAÇÕES', dados.aplicacoes)}
        ${this.gerarHTMLSecao('RESGATES/VENCIMENTOS', dados.resgates)}
        ${this.gerarHTMLSecao('SALDO FINAL', dados.saldoFinal)}
      </tbody>
    </table>
</body>
</html>`;
  }

  private gerarHTMLSecao(titulo: string, secao: any): string {
    if (!secao?.itens || secao.itens.length === 0) return '';

    const tituloCompleto = secao.dataSaldo ? `${titulo} em ${secao.dataSaldo}` : titulo;

    return `
      <tr class="section-title">
        <th colspan="11">${tituloCompleto}</th>
      </tr>
      ${secao.itens.map((item: any) => `
        <tr class="data-row">
          <td>${this.formatarData(item.dataAplicacao)}</td>
          <td>${this.formatarData(item.dataVencimento)}</td>
          <td>${this.formatarData(item.dataResgate) || ''}</td>
          <td>${item.taxa || ''}</td>
          <td class="currency">${this.formatarMoeda(item.valorPrincipal)}</td>
          <td class="currency">${this.formatarMoeda(item.valorBruto)}</td>
          <td class="currency">${this.formatarMoeda(item.rendaTotal)}</td>
          <td class="currency">${this.formatarMoeda(item.iof)}</td>
          <td class="currency">${this.formatarMoeda(item.irrf)}</td>
          <td class="currency">${this.formatarMoeda(item.valorLiquido)}</td>
          <td class="currency">${this.formatarMoeda(item.rendaBrutaPer)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td><strong>Total</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalValorPrincipal)}</strong></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalValorBruto)}</strong></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalRendaTotal)}</strong></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalIof)}</strong></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalIrrf)}</strong></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalValorLiquido)}</strong></td>
        <td class="currency"><strong>${this.formatarMoeda(secao.totalRendaBrutaPer)}</strong></td>
      </tr>
    `;
  }

  private formatarData(data: string): string {
    return data;
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
