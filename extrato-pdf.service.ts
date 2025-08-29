import { Injectable } from '@angular/core';
import { ExtratoDados, ExtratoSecao, ExtratoItem } from './types/extrato.types';

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
    // Cabeçalho simples igual à imagem
    let csv = 'Seção,Data Aplica,Data Vencir,Data Resgal,Taxa (%),Valor Princi,Valor Bruto,Renda Tota,IOF (BRL),IRRF (BRL),Valor Líquic,Renda Bruta Per (BRL)\n';

    // Saldo anterior
    if (dados.saldoAnterior?.itens) {
      csv += `Saldo anterior em ${dados.saldoAnterior.dataSaldo}\n`;
      dados.saldoAnterior.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Saldo Anter', item);
      });
      csv += this.totaisParaCSVSimples('Saldo Anterior - TOTAL', dados.saldoAnterior);
    }

    // Aplicações
    if (dados.aplicacoes?.itens) {
      csv += 'Aplicações\n';
      dados.aplicacoes.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Aplicações', item);
      });
      csv += this.totaisParaCSVSimples('Aplicações - TOTAL', dados.aplicacoes);
    }

    // Resgates/Vencimentos
    if (dados.resgates?.itens) {
      csv += 'Resgates/Vencimentos\n';
      dados.resgates.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Resgates', item);
      });
      csv += this.totaisParaCSVSimples('Resgates - TOTAL', dados.resgates);
    }

    // Saldo final
    if (dados.saldoFinal?.itens) {
      csv += `Saldo final em ${dados.saldoFinal.dataSaldo}\n`;
      dados.saldoFinal.itens.forEach(item => {
        csv += this.itemParaCSVSimples('Saldo Final', item);
      });
      csv += this.totaisParaCSVSimples('Saldo Final - TOTAL', dados.saldoFinal);
    }

    return csv;
  }

  private itemParaCSVSimples(secao: string, item: ExtratoItem): string {
    const formatarNumero = (valor: number | undefined) => valor ? valor.toFixed(2) : '';
    return `${secao},########,########,########,${item.taxa ? item.taxa.toFixed(2) : ''},${formatarNumero(item.valorPrincipal)},${formatarNumero(item.valorBruto)},${formatarNumero(item.rendaTotal)},${formatarNumero(item.iof)},${formatarNumero(item.irrf)},${formatarNumero(item.valorLiquido)},${formatarNumero(item.rendaBrutaPer)}\n`;
  }

  private totaisParaCSVSimples(secao: string, dados: ExtratoSecao): string {
    const formatarNumero = (valor: number | undefined) => valor ? valor.toFixed(2) : '';
    return `${secao},,,,,${formatarNumero(dados.totalValorPrincipal)},${formatarNumero(dados.totalValorBruto)},${formatarNumero(dados.totalRendaTotal)},${formatarNumero(dados.totalIof)},${formatarNumero(dados.totalIrrf)},${formatarNumero(dados.totalValorLiquido)},${formatarNumero(dados.totalRendaBrutaPer)}\n`;
  }

  private itemParaCSVProfissional(secao: string, item: ExtratoItem): string {
    const formatarNumero = (valor: number | undefined) => (valor || 0).toFixed(2).replace('.', ',');
    
    return `"${secao}","${this.formatarData(item.dataAplicacao)}","${this.formatarData(item.dataVencimento)}","${this.formatarData(item.dataResgate)}","${(item.taxa || 0).toFixed(2).replace('.', ',')}","${formatarNumero(item.valorPrincipal)}","${formatarNumero(item.valorBruto)}","${formatarNumero(item.rendaTotal)}","${formatarNumero(item.iof)}","${formatarNumero(item.irrf)}","${formatarNumero(item.valorLiquido)}","${formatarNumero(item.rendaBrutaPer)}"\n`;
  }

  private totaisParaCSVProfissional(secao: string, dados: ExtratoSecao): string {
    const formatarNumero = (valor: number | undefined) => (valor || 0).toFixed(2).replace('.', ',');
    
    return `"${secao} - TOTAL","","","","","${formatarNumero(dados.totalValorPrincipal)}","${formatarNumero(dados.totalValorBruto)}","${formatarNumero(dados.totalRendaTotal)}","${formatarNumero(dados.totalIof)}","${formatarNumero(dados.totalIrrf)}","${formatarNumero(dados.totalValorLiquido)}","${formatarNumero(dados.totalRendaBrutaPer)}"\n`;
  }

  private gerarResumoExecutivoCSV(dados: ExtratoDados): string {
    const totais = {
      saldoAnterior: dados.saldoAnterior?.totalValorLiquido || 0,
      aplicacoes: dados.aplicacoes?.totalValorLiquido || 0,
      resgates: dados.resgates?.totalValorLiquido || 0,
      saldoFinal: dados.saldoFinal?.totalValorLiquido || 0
    };

    let resumo = '';
    resumo += `Saldo Anterior Total: R$ ${this.formatarMoedaCSV(totais.saldoAnterior)}\n`;
    resumo += `Aplicações Total: R$ ${this.formatarMoedaCSV(totais.aplicacoes)}\n`;
    resumo += `Resgates Total: R$ ${this.formatarMoedaCSV(totais.resgates)}\n`;
    resumo += `Saldo Final Total: R$ ${this.formatarMoedaCSV(totais.saldoFinal)}\n\n`;
    
    const variacao = totais.saldoFinal - totais.saldoAnterior;
    const percentualVariacao = totais.saldoAnterior > 0 ? (variacao / totais.saldoAnterior) * 100 : 0;
    
    resumo += `Variação do Período: R$ ${this.formatarMoedaCSV(variacao)}\n`;
    resumo += `Percentual de Variação: ${percentualVariacao.toFixed(2).replace('.', ',')}%\n`;
    
    return resumo;
  }

  private gerarHTMLCorporativo(dados: ExtratoDados, config: PDFConfig): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Extrato Bancário - Bradesco Corporate</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            color: #000;
            line-height: 1.3;
            padding: 25px;
            margin: 0 auto;
            max-width: 1200px;
        }

        .header {
            text-align: left;
            margin-bottom: 25px;
            padding-bottom: 15px;
            position: relative;
        }

        .logo {
            font-size: 22px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 4px;
            text-transform: none; 
        }

        .subtitle {
            font-size: 12px;
            color: #ffffff;
            margin-bottom: 20px;
            text-transform: none;
            background-color: #666;
            padding: 4px 8px;
            display: inline-block;
            border-radius: 4px;
        }

        .report-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
            position: absolute;
            top: 0;
            right: 0;
        }

        .report-details {
            display: block;
            margin-bottom: 0;
            font-size: 12px;
            color: #666;
            position: absolute;
            top: 0px;
            left: 30%;
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
            font-size: 11px;
            font-weight: bold;
        }

        .detail-grid {
            display: block;
            gap: 0;
        }

        .detail-item {
            display: block;
            padding: 1px 0;
            border-bottom: none;
            font-size: 9px;
            margin-bottom: 1px;
        }

        .detail-label {
            font-weight: bold;
            color: #000;
            display: inline;
        }

        .detail-value {
            color: #000;
            display: inline;
        }

        .table-container {
            margin-bottom: 25px;
        }

        .table-title {
            background-color: transparent;
            color: #000;
            padding: 8px 0;
            font-weight: bold;
            font-size: 12px;
            border-radius: 0;
            border-bottom: 1px solid #ddd;
            margin-bottom: 8px;
        }

        .financial-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
            font-size: 8px;
            border: none;
        }
        
        .financial-table th {
            background-color: transparent;
            color: #000;
            padding: 6px 4px;
            text-align: center;
            border: none;
            font-weight: bold;
            font-size: 10px;
            border-bottom: 1px solid #ccc;
        }

        .financial-table td {
            padding: 5px 4px;
            text-align: center;
            border: none;
            color: #000;
            font-size: 10px;
            border-bottom: 1px solid #eee;
        }

        /* Alinhamento específico baseado na imagem */
        .financial-table th:nth-child(1),
        .financial-table td:nth-child(1) {
            text-align: left !important;
            padding-left: 3px !important;
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
            padding-right: 3px !important;
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

        .data-row:nth-child(even) {
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

        /* Alinhamento específico para total-row */
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

        .currency {
            font-family: 'Courier New', monospace;
            font-size: 10px;
        }

        .date {
            font-size: 10px;
        }

        .percentage {
            font-size: 10px;
        }

        @media print {
            body { margin: 0; }
            .action-buttons { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">bradesco corporate</div>
        <div class="subtitle">global solutions</div>
        <div class="report-title">Saldo e extrato</div>
        <div class="report-details">
            <div><strong>Data da transação:</strong> ${config.dataTransacao} - ${new Date().toLocaleTimeString('pt-BR')}</div>
            <div><strong>Número de controle:</strong> ${config.numeroControle}</div>
        </div>
    </div>

    <div class="search-details">
        <h3>Detalhes da pesquisa</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Empresa:</span> <span class="detail-value">${dados.empresa}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Agência/Conta:</span> <span class="detail-value">${dados.agencia}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tipo de investimento:</span> <span class="detail-value">${dados.tipoInvestimento}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tipo de produto:</span> <span class="detail-value">${dados.tipoProduto}</span>
            </div>
        </div>
    </div>

    <div class="table-container">
        <table class="financial-table">
            <thead>
                <tr style="background-color: #ddd; padding: 12px 0;">
                    <th style="text-align: left; padding-left: 20px;">Data aplic.</th>
                    <th style="text-align: left; padding-left: 3px;">Data vencto.</th>
                    <th style="text-align: left; padding-left: 3px;">Resgate/Carência</th>
                    <th style="text-align: center;">Taxa (%)</th>
                    <th style="text-align: right; padding-right: 3px;">Valor princ. (BRL)</th>
                    <th style="text-align: right; padding-right: 3px;">Valor Bruto (BRL)</th> 
                    <th style="text-align: right; padding-right: 3px;">Renda total (BRL)</th>
                    <th style="text-align: right; padding-right: 3px;">IOF (BRL)</th>
                    <th style="text-align: right; padding-right: 3px;">IRRF (BRL)</th>
                    <th style="text-align: right; padding-right: 3px;">Valor Líquido (BRL)</th>
                    <th style="text-align: right; padding-right: 10px;">Renda bruta per</th>
                </tr>
            </thead>
            <tbody>
                ${this.gerarHTMLSecao('SALDO ANTERIOR', dados.saldoAnterior)}
                ${this.gerarHTMLSecao('APLICAÇÕES', dados.aplicacoes)}
                ${this.gerarHTMLSecao('RESGATES/VENCIMENTOS', dados.resgates)}
                ${this.gerarHTMLSecao('SALDO FINAL', dados.saldoFinal)}
            </tbody>
        </table>
    </div>
</body>
</html>`;
  }

  private gerarHTMLSecao(titulo: string, secao: ExtratoSecao | null | undefined): string {
    if (!secao?.itens || secao.itens.length === 0) return '';

    const tituloCompleto = secao.dataSaldo ? `${titulo} em ${secao.dataSaldo}` : titulo;

    return `
      <tr class="section-title">
        <th colspan="11">${tituloCompleto}</th>
      </tr>
      ${secao.itens.map((item: ExtratoItem) => `
        <tr class="data-row">
          <td>${this.formatarData(item.dataAplicacao)}</td>
          <td>${this.formatarData(item.dataVencimento)}</td>
          <td>${this.formatarData(item.dataResgate)}</td>
          <td>${item.taxa || ''}</td>
          <td class="currency">${this.formatarMoeda(item.valorPrincipal || 0)}</td>
          <td class="currency">${this.formatarMoeda(item.valorBruto || 0)}</td>
          <td class="currency">${this.formatarMoeda(item.rendaTotal || 0)}</td>
          <td class="currency">${this.formatarMoeda(item.iof || 0)}</td>
          <td class="currency">${this.formatarMoeda(item.irrf || 0)}</td>
          <td class="currency">${this.formatarMoeda(item.valorLiquido || 0)}</td>
          <td class="currency">${this.formatarMoeda(item.rendaBrutaPer || 0)}</td>
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
        <td class="currency"><strong>${this.formatarMoeda(secao.totalRendaBrutaPer || 0)}</strong></td>
      </tr>
    `;
  }

  private formatarData(data: string | undefined | null): string {
    return data || '';
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  private formatarMoedaCSV(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
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
