import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ExtratoDados, ExtratoSecao, ExtratoItem } from './types/extrato.types';

export interface PDFConfig {
  title: string;
  subtitle: string;
  dataTransacao: string;
  numeroControle: string;
  fileName: string;
}

/**
 * Service profissional para geração de extratos bancários
 * Suporta PDF corporativo, CSV formatado e HTML export
 */
@Injectable({
  providedIn: 'root'
})
export class ExtratoPdfService {

  // Constantes para configuração
  private readonly BRAND_COLOR = '#0066cc';
  private readonly BRAND_NAME = 'BRADESCO CORPORATE';
  private readonly BRAND_SUBTITLE = 'Global Solutions';
  private readonly DOCUMENT_TITLE = 'SALDO E EXTRATO';

  constructor() { }

  /**
   * Cria configuração padrão para PDF
   */
  criarConfigPDF(dataTransacao: string, numeroControle: string): PDFConfig {
    return {
      title: this.BRAND_NAME,
      subtitle: this.BRAND_SUBTITLE,
      dataTransacao,
      numeroControle,
      fileName: `extrato_bradesco_${dataTransacao.replace(/\//g, '')}.pdf`
    };
  }

  /**
   * Gera PDF corporativo usando jsPDF
   */
  async gerarPDFCorporativo(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    try {
      await this.gerarPDFComJsPDF(dados, config);
    } catch (error) {
      console.warn('Erro ao gerar PDF com jsPDF, usando fallback:', error);
      this.gerarPDFPrintCorporativo(dados, config);
    }
  }

  /**
   * Gera PDF usando jsPDF com layout corporativo profissional
   */
  private async gerarPDFComJsPDF(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;

    // Cabeçalho corporativo
    this.adicionarCabecalhoPDF(pdf, config, pageWidth, yPosition);
    yPosition += 25;

    // Informações do relatório
    yPosition = this.adicionarInformacoesRelatorio(pdf, config, margin, yPosition);
    yPosition += 10;

    // Detalhes da empresa
    yPosition = this.adicionarDetalhesEmpresa(pdf, dados, margin, yPosition);
    yPosition += 15;

    // Dados do extrato
    yPosition = this.adicionarDadosExtrato(pdf, dados, margin, yPosition);

    // Resumo executivo
    yPosition = this.adicionarResumoExecutivo(pdf, dados, margin, yPosition);

    // Rodapé corporativo
    this.adicionarRodapePDF(pdf, pageWidth, pageHeight);

    // Salvar PDF
    pdf.save(config.fileName);
  }

  /**
   * Adiciona cabeçalho corporativo ao PDF
   */
  private adicionarCabecalhoPDF(pdf: jsPDF, config: PDFConfig, pageWidth: number, yPosition: number): void {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204); // Azul Bradesco
    pdf.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(102, 102, 102);
    pdf.text(config.subtitle, pageWidth / 2, yPosition + 8, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(this.DOCUMENT_TITLE, pageWidth / 2, yPosition + 16, { align: 'center' });
  }

  /**
   * Adiciona informações do relatório
   */
  private adicionarInformacoesRelatorio(pdf: jsPDF, config: PDFConfig, margin: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    pdf.text('INFORMAÇÕES DO RELATÓRIO', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Data da transação: ${config.dataTransacao}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Número de controle: ${config.numeroControle}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Hora de geração: ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition);

    return yPosition;
  }

  /**
   * Adiciona detalhes da empresa
   */
  private adicionarDetalhesEmpresa(pdf: jsPDF, dados: ExtratoDados, margin: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    pdf.text('DETALHES DA PESQUISA', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Empresa: ${dados.empresa}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Agência/Conta: ${dados.agencia}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tipo de investimento: ${dados.tipoInvestimento}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tipo de produto: ${dados.tipoProduto}`, margin, yPosition);

    return yPosition;
  }

  /**
   * Adiciona dados do extrato
   */
  private adicionarDadosExtrato(pdf: jsPDF, dados: ExtratoDados, margin: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    pdf.text('DADOS DO EXTRATO', margin, yPosition);
    yPosition += 10;

    // Saldo Anterior
    if (dados.saldoAnterior?.itens?.length) {
      yPosition = this.adicionarSecaoPDF(pdf, 'SALDO ANTERIOR', dados.saldoAnterior, margin, yPosition);
    }

    // Aplicações
    if (dados.aplicacoes?.itens?.length) {
      yPosition = this.adicionarSecaoPDF(pdf, 'APLICAÇÕES', dados.aplicacoes, margin, yPosition);
    }

    // Resgates
    if (dados.resgates?.itens?.length) {
      yPosition = this.adicionarSecaoPDF(pdf, 'RESGATES/VENCIMENTOS', dados.resgates, margin, yPosition);
    }

    // Saldo Final
    if (dados.saldoFinal?.itens?.length) {
      yPosition = this.adicionarSecaoPDF(pdf, 'SALDO FINAL', dados.saldoFinal, margin, yPosition);
    }

    return yPosition;
  }

  /**
   * Adiciona seção de dados ao PDF
   */
  private adicionarSecaoPDF(pdf: jsPDF, titulo: string, secao: ExtratoSecao, margin: number, yPosition: number): number {
    // Verificar se precisa de nova página
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Título da seção
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    const tituloCompleto = secao.dataSaldo ? `${titulo} em ${secao.dataSaldo}` : titulo;
    pdf.text(tituloCompleto, margin, yPosition);
    yPosition += 8;

    // Cabeçalho da tabela
    const headers = ['Data Aplic.', 'Data Vencto.', 'Data Resgate', 'Taxa (%)', 'Valor Princ.', 'Valor Bruto', 'Renda Total', 'IOF', 'IRRF', 'Valor Líquido', 'Renda Bruta'];
    const colWidths = [20, 20, 20, 15, 25, 25, 25, 15, 15, 25, 25];
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    
    let xPosition = margin;
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 6;

    // Dados da seção
    pdf.setFont('helvetica', 'normal');
    secao.itens.forEach(item => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      xPosition = margin;
      pdf.text(this.formatarData(item.dataAplicacao), xPosition, yPosition);
      xPosition += colWidths[0];
      
      pdf.text(this.formatarData(item.dataVencimento), xPosition, yPosition);
      xPosition += colWidths[1];
      
      pdf.text(this.formatarData(item.dataResgate), xPosition, yPosition);
      xPosition += colWidths[2];
      
      pdf.text(item.taxa.toFixed(2), xPosition, yPosition);
      xPosition += colWidths[3];
      
      pdf.text(this.formatarMoeda(item.valorPrincipal), xPosition, yPosition);
      xPosition += colWidths[4];
      
      pdf.text(this.formatarMoeda(item.valorBruto), xPosition, yPosition);
      xPosition += colWidths[5];
      
      pdf.text(this.formatarMoeda(item.rendaTotal), xPosition, yPosition);
      xPosition += colWidths[6];
      
      pdf.text(this.formatarMoeda(item.iof), xPosition, yPosition);
      xPosition += colWidths[7];
      
      pdf.text(this.formatarMoeda(item.irrf), xPosition, yPosition);
      xPosition += colWidths[8];
      
      pdf.text(this.formatarMoeda(item.valorLiquido), xPosition, yPosition);
      xPosition += colWidths[9];
      
      pdf.text(this.formatarMoeda(item.rendaBrutaPer), xPosition, yPosition);

      yPosition += 5;
    });

    // Total da seção
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    xPosition = margin;
    pdf.text(`${titulo} - TOTAL`, xPosition, yPosition);
    xPosition += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
    
    pdf.text(this.formatarMoeda(secao.totalValorPrincipal), xPosition, yPosition);
    xPosition += colWidths[4];
    
    pdf.text(this.formatarMoeda(secao.totalValorBruto), xPosition, yPosition);
    xPosition += colWidths[5];
    
    pdf.text(this.formatarMoeda(secao.totalRendaTotal), xPosition, yPosition);
    xPosition += colWidths[6];
    
    pdf.text(this.formatarMoeda(secao.totalIof), xPosition, yPosition);
    xPosition += colWidths[7];
    
    pdf.text(this.formatarMoeda(secao.totalIrrf), xPosition, yPosition);
    xPosition += colWidths[8];
    
    pdf.text(this.formatarMoeda(secao.totalValorLiquido), xPosition, yPosition);
    xPosition += colWidths[9];
    
    pdf.text(this.formatarMoeda(secao.totalRendaBrutaPer), xPosition, yPosition);

    return yPosition + 15;
  }

  /**
   * Adiciona resumo executivo
   */
  private adicionarResumoExecutivo(pdf: jsPDF, dados: ExtratoDados, margin: number, yPosition: number): number {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    pdf.text('RESUMO EXECUTIVO', margin, yPosition);
    yPosition += 8;

    const saldoAnterior = dados.saldoAnterior?.totalValorLiquido || 0;
    const aplicacoes = dados.aplicacoes?.totalValorLiquido || 0;
    const resgates = dados.resgates?.totalValorLiquido || 0;
    const saldoFinal = dados.saldoFinal?.totalValorLiquido || 0;
    const variacao = saldoFinal - saldoAnterior;
    const percentualVariacao = saldoAnterior > 0 ? (variacao / saldoAnterior) * 100 : 0;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    pdf.text(`Saldo Anterior Total: R$ ${this.formatarMoeda(saldoAnterior)}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Aplicações Total: R$ ${this.formatarMoeda(aplicacoes)}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Resgates Total: R$ ${this.formatarMoeda(resgates)}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Saldo Final Total: R$ ${this.formatarMoeda(saldoFinal)}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Variação do Período: R$ ${this.formatarMoeda(variacao)}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Percentual de Variação: ${percentualVariacao.toFixed(2)}%`, margin, yPosition);

    return yPosition;
  }

  /**
   * Adiciona rodapé corporativo
   */
  private adicionarRodapePDF(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(102, 102, 102);
    
    pdf.text('Documento gerado automaticamente pelo sistema Bradesco Corporate', pageWidth / 2, pageHeight - 20, { align: 'center' });
    pdf.text('Este documento é confidencial e de uso interno da empresa', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Bradesco Corporate - Global Solutions', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  /**
   * Gera PDF corporativo usando impressão do navegador (fallback)
   */
  private gerarPDFPrintCorporativo(dados: ExtratoDados, config: PDFConfig): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up bloqueado. Permita pop-ups para gerar o PDF.');
      return;
    }

    const htmlContent = this.gerarHTMLCorporativo(dados, config);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  /**
   * Gera HTML corporativo para impressão
   */
  private gerarHTMLCorporativo(dados: ExtratoDados, config: PDFConfig): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Extrato Bancário - Bradesco Corporate</title>
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
            font-size: 11px;
            border-bottom: 1px solid #eee;
          }

          .financial-table th:nth-child(1),
          .financial-table td:nth-child(1) {
            text-align: left !important;
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
          }

          .financial-table tr {
            padding: 6px 0;
          }
          
          .financial-table tr th {
            padding: 12px 0;
          }

          .financial-table tr:nth-child(even) {
            background-color: transparent;
            padding: 6px 0;
          }

          .financial-table tr:hover {
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
          }

          .total-row td:first-child {
            text-align: left !important;
            padding-left: 3px !important;
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
            body {
              background-color: white;
              color: black;
              padding: 6px;
            }
            
            .header, .search-details, .table-container {
              break-inside: avoid;
            }
            
            .financial-table {
              page-break-inside: avoid;
              font-size: 6px;
            }
            
            .financial-table th,
            .financial-table td {
              font-size: 6px;
              padding: 1px 1px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Cabeçalho -->
        <div class="header">
          <div class="logo">bradesco corporate</div>
          <div class="subtitle">global solutions</div>
          <div class="report-details">
            <div><strong>Saldo e extrato</strong></div>
            <div>
              <strong>Data da transação:</strong> 
              <span>${config.dataTransacao} - ${new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
            <div>
              <strong>Número de controle:</strong> 
              <span>${config.numeroControle}</span>
            </div>
          </div>
        </div>

        <!-- Detalhes da Pesquisa -->
        <div class="search-details">
          <h3>Detalhes da Pesquisa</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Empresa | CNPJ: </span>
              <span class="detail-value">${dados.empresa} | 49.320.901/0001-50</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Agência | Conta: </span>
              <span class="detail-value">${dados.agencia}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data da busca: </span>
              <span class="detail-value">${dados.dataBusca}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tipo de investimento: </span>
              <span class="detail-value">${dados.tipoInvestimento}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tipo de Produto: </span>
              <span class="detail-value">${dados.tipoProduto}</span>
            </div>
          </div>
        </div>

        <!-- Tabela Principal com Dados Dinâmicos -->
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
              ${this.gerarHTMLSecaoComThead('RESGATES/VENCIMENTOS', dados.resgates)}
              ${this.gerarHTMLSecao('SALDO FINAL', dados.saldoFinal)}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gera HTML para uma seção do extrato
   */
  private gerarHTMLSecao(titulo: string, secao: ExtratoSecao | null): string {
    if (!secao?.itens || secao.itens.length === 0) return '';

    const tituloCompleto = secao.dataSaldo ? `${titulo} em ${secao.dataSaldo}` : titulo;

    return `
      <!-- ${titulo} -->
      <tr class="section-title">
        <th colspan="11">${tituloCompleto}</th>
      </tr>
      ${secao.itens.map(item => `
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

  /**
   * Gera HTML para uma seção do extrato com thead duplicado (como no template padrão)
   */
  private gerarHTMLSecaoComThead(titulo: string, secao: ExtratoSecao | null): string {
    if (!secao?.itens || secao.itens.length === 0) return '';

    const tituloCompleto = secao.dataSaldo ? `${titulo} em ${secao.dataSaldo}` : titulo;

    return `
      <!-- ${titulo} -->
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
      <tr class="section-title">
        <th colspan="11">${tituloCompleto}</th>
      </tr>
      ${secao.itens.map(item => `
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

  /**
   * Gera PDF usando print do navegador
   */
  gerarPDFPrint(): void {
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'none';
    }

    window.print();

    setTimeout(() => {
      if (actionButtons) {
        (actionButtons as HTMLElement).style.display = 'flex';
      }
    }, 1000);
  }

  /**
   * Exporta dados como HTML
   */
  exportarHTML(dados: ExtratoDados, config: PDFConfig): void {
    const element = document.getElementById('extrato-container');
    if (!element) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title} - ${config.subtitle}</title>
    <style>
        ${this.getCSSStyles()}
    </style>
</head>
<body>
    ${element.outerHTML}
</body>
</html>`;

    this.downloadFile(htmlContent, config.fileName.replace('.pdf', '.html'), 'text/html');
  }

  /**
   * Gera arquivo CSV com formatação corporativa
   */
  gerarCSV(dados: ExtratoDados, config: PDFConfig): void {
    const BOM = '\uFEFF';
    const csvContent = BOM + this.converterParaCSV(dados);
    this.downloadFile(csvContent, config.fileName.replace('.pdf', '.csv'), 'text/csv;charset=utf-8;');
  }

  /**
   * Converte dados para formato CSV corporativo
   */
  private converterParaCSV(dados: ExtratoDados): string {
    let csv = `${this.BRAND_NAME}\n`;
    csv += `${this.BRAND_SUBTITLE}\n`;
    csv += `${this.DOCUMENT_TITLE}\n`;
    csv += '='.repeat(80) + '\n\n';
    
    // Informações do relatório
    csv += 'INFORMAÇÕES DO RELATÓRIO\n';
    csv += '-'.repeat(40) + '\n';
    csv += `Data da transação: ${dados.dataBusca}\n`;
    csv += `Número de controle: ${dados.dataBusca.replace(/\//g, '')}001\n`;
    csv += `Data de geração: ${new Date().toLocaleDateString('pt-BR')}\n`;
    csv += `Hora de geração: ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
    
    // Detalhes da empresa
    csv += 'DETALHES DA PESQUISA\n';
    csv += '-'.repeat(40) + '\n';
    csv += `Empresa: ${dados.empresa}\n`;
    csv += `Agência/Conta: ${dados.agencia}\n`;
    csv += `Tipo de investimento: ${dados.tipoInvestimento}\n`;
    csv += `Tipo de produto: ${dados.tipoProduto}\n\n`;
    
    // Cabeçalho da tabela principal
    csv += 'DADOS DO EXTRATO\n';
    csv += '-'.repeat(40) + '\n';
    csv += 'Seção,Data Aplicação,Data Vencimento,Data Resgate,Taxa (%),Valor Principal (R$),Valor Bruto (R$),Renda Total (R$),IOF (R$),IRRF (R$),Valor Líquido (R$),Renda Bruta Per (R$)\n';

    // Saldo Anterior
    if (dados.saldoAnterior?.itens) {
      csv += `\nSALDO ANTERIOR em ${dados.saldoAnterior.dataSaldo}\n`;
      csv += '-'.repeat(40) + '\n';
      dados.saldoAnterior.itens.forEach(item => {
        csv += this.itemParaCSV('Saldo Anterior', item);
      });
      csv += this.totaisParaCSV('Saldo Anterior', dados.saldoAnterior);
    }

    // Aplicações
    if (dados.aplicacoes?.itens) {
      csv += '\nAPLICAÇÕES\n';
      csv += '-'.repeat(40) + '\n';
      dados.aplicacoes.itens.forEach(item => {
        csv += this.itemParaCSV('Aplicações', item);
      });
      csv += this.totaisParaCSV('Aplicações', dados.aplicacoes);
    }

    // Resgates
    if (dados.resgates?.itens) {
      csv += '\nRESGATES/VENCIMENTOS\n';
      csv += '-'.repeat(40) + '\n';
      dados.resgates.itens.forEach(item => {
        csv += this.itemParaCSV('Resgates', item);
      });
      csv += this.totaisParaCSV('Resgates', dados.resgates);
    }

    // Saldo Final
    if (dados.saldoFinal?.itens) {
      csv += `\nSALDO FINAL em ${dados.saldoFinal.dataSaldo}\n`;
      csv += '-'.repeat(40) + '\n';
      dados.saldoFinal.itens.forEach(item => {
        csv += this.itemParaCSV('Saldo Final', item);
      });
      csv += this.totaisParaCSV('Saldo Final', dados.saldoFinal);
    }

    // Resumo executivo
    csv += '\nRESUMO EXECUTIVO\n';
    csv += '='.repeat(80) + '\n';
    csv += this.gerarResumoExecutivoCSV(dados);
    
    // Rodapé corporativo
    csv += '\nRODAPÉ CORPORATIVO\n';
    csv += '='.repeat(80) + '\n';
    csv += 'Documento gerado automaticamente pelo sistema Bradesco Corporate\n';
    csv += 'Este documento é confidencial e de uso interno da empresa\n';
    csv += 'Para dúvidas, entre em contato com seu gerente de relacionamento\n';
    csv += 'Bradesco Corporate - Global Solutions\n';
    csv += `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n`;
    csv += '='.repeat(80) + '\n';

    return csv;
  }

  /**
   * Gera resumo executivo para CSV
   */
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

  /**
   * Converte item para CSV
   */
  private itemParaCSV(secao: string, item: ExtratoItem): string {
    const formatarNumero = (valor: number) => valor.toFixed(2).replace('.', ',');
    
    return `"${secao}","${this.formatarData(item.dataAplicacao)}","${this.formatarData(item.dataVencimento)}","${this.formatarData(item.dataResgate)}","${item.taxa.toFixed(2).replace('.', ',')}","${formatarNumero(item.valorPrincipal)}","${formatarNumero(item.valorBruto)}","${formatarNumero(item.rendaTotal)}","${formatarNumero(item.iof)}","${formatarNumero(item.irrf)}","${formatarNumero(item.valorLiquido)}","${formatarNumero(item.rendaBrutaPer)}"\n`;
  }

  /**
   * Converte totais para CSV
   */
  private totaisParaCSV(secao: string, dados: ExtratoSecao): string {
    const formatarNumero = (valor: number) => valor.toFixed(2).replace('.', ',');
    
    return `"${secao} - TOTAL","","","","","${formatarNumero(dados.totalValorPrincipal)}","${formatarNumero(dados.totalValorBruto)}","${formatarNumero(dados.totalRendaTotal)}","${formatarNumero(dados.totalIof)}","${formatarNumero(dados.totalIrrf)}","${formatarNumero(dados.totalValorLiquido)}","${formatarNumero(dados.totalRendaBrutaPer)}"\n`;
  }

  /**
   * Obtém estilos CSS para exportação HTML
   */
  private getCSSStyles(): string {
    return `
      .extrato-container {
        font-family: Arial, sans-serif;
        background-color: #ffffff;
        color: #000;
        line-height: 1.3;
        padding: 20px;
        margin: 0 auto;
        max-width: 1200px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 5px;
      }
      .subtitle {
        font-size: 16px;
        color: #666;
        margin-bottom: 5px;
      }
      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #0066cc;
      }
      .info-row {
        margin-bottom: 5px;
        font-size: 11px;
      }
      .subsection {
        margin-bottom: 20px;
      }
      .subsection-title {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #333;
        background-color: #f5f5f5;
        padding: 6px 8px;
        border-left: 3px solid #0066cc;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        font-size: 11px;
      }
      .data-table th,
      .data-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .data-table th {
        background-color: #f5f5f5;
        font-weight: bold;
        text-align: center;
      }
      .total-row {
        font-weight: bold;
        background-color: #f9f9f9;
      }
      .total-row td {
        border-top: 2px solid #ddd;
      }
      .currency {
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }
      .date {
        font-size: 11px;
      }
      .percentage {
        font-size: 11px;
      }
      .resumo-content {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        border-left: 4px solid #0066cc;
      }
      .resumo-item {
        margin-bottom: 8px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }
      .action-buttons {
        display: none;
      }
    `;
  }

  /**
   * Download de arquivo
   */
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

  /**
   * Formata data para exibição
   */
  private formatarData(data: string): string {
    return data;
  }

  /**
   * Formata moeda para exibição
   */
  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  /**
   * Formata moeda para CSV
   */
  private formatarMoedaCSV(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
  }
}
