import { Component, Input, OnInit, signal, computed, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WebViewDownloadService } from '../../shared/services/webview-download.service';
import { detectWebViewType } from '../../webview.config';
import { ExtratoDados, RendaFixaData } from '../../../../types/extrato.types';
import { MOCK_EXTRATO_DATA, RENDA_FIXA_DATA } from '../../../../data/mock-extrato.data';
import { ExtratoFormatPipe } from './extrato-format.pipe';

@Component({
  selector: 'app-extrato-pdf',
  templateUrl: './extrato-pdf.component.html',
  styleUrls: ['./extrato-pdf.component.scss'],
  standalone: true,
  imports: [CommonModule, ExtratoFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtratoPdfComponent implements OnInit, OnDestroy {
  @Input() extratoData: ExtratoDados | null = null;

  private readonly router = inject(Router);
  private readonly webViewDownloadService = inject(WebViewDownloadService);
  private readonly destroy$ = new Subject<void>();

  // Signals
  public readonly dadosAtuais = signal<ExtratoDados | null>(null);
  public readonly rendaFixaData = signal<RendaFixaData | null>(null);
  public readonly config = signal<any>(null);
  public readonly isLoading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly isPrintMode = signal(false);

  // WebView detection signals
  public readonly isWebView = signal(false);
  public readonly webViewType = signal<'ios' | 'android' | 'desktop'>('desktop');
  public readonly canDownload = signal(false);
  public readonly canShare = signal(false);

  // Computed values
  public readonly temSaldoAnterior = computed(() => this.temItens(this.rendaFixaData()?.rendaFixa?.saldoAnterior));
  public readonly temAplicacoes = computed(() => this.temItens(this.rendaFixaData()?.rendaFixa?.aplicacao));
  public readonly temResgates = computed(() => this.temItens(this.rendaFixaData()?.rendaFixa?.resgate));
  public readonly temSaldoFinal = computed(() => this.temItens(this.rendaFixaData()?.rendaFixa?.saldoFinal));

  // Mock data
  private readonly mockData = MOCK_EXTRATO_DATA;
  private readonly rendaFixaMockData = RENDA_FIXA_DATA;

  ngOnInit(): void {
    const data = this.extratoData || this.mockData;
    this.dadosAtuais.set(data);
    this.rendaFixaData.set(this.rendaFixaMockData);
    
    this.config.set({
      titulo: 'Extrato Bancário',
      dataTransacao: data.dataBusca,
      numeroControle: this.gerarNumeroControle(),
      empresa: data.empresa,
      agencia: data.agencia,
      dataBusca: data.dataBusca,
      tipoInvestimento: data.tipoInvestimento,
      tipoProduto: data.tipoProduto,
    });

    // Detectar WebView e configurar capacidades
    this.detectWebViewCapabilities();
  }

  private detectWebViewCapabilities(): void {
    const webViewType = detectWebViewType();
    this.webViewType.set(webViewType);
    this.isWebView.set(webViewType !== 'desktop');
    this.canDownload.set(this.webViewDownloadService.canDownload());
    this.canShare.set(this.webViewDownloadService.canShare());
  }

  // Método para verificar se há itens
  private temItens(secao: any): boolean {
    const result = secao && Array.isArray(secao) && secao.length > 0;
    return result;
  }

  // Método para gerar número de controle
  private gerarNumeroControle(): string {
    return `CTRL${Date.now().toString().slice(-8)}`;
  }

  // Método para formatar moeda
  public formatarMoeda(valor: number | undefined): string {
    if (valor === undefined || valor === null) return '0,00';
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Método para obter data de geração
  public getDataGeracao(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  // Método para obter hora de geração
  public getHoraGeracao(): string {
    return new Date().toLocaleTimeString('pt-BR');
  }

  // Método para obter número de controle
  public getNumeroControle(): string {
    return this.config()?.numeroControle || this.gerarNumeroControle();
  }

  // Método para gerar PDF simples
  async gerarPDF(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      window.print();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.error.set('Erro ao gerar PDF. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Método para gerar PDF corporativo
  async gerarPDFCorporativo(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const element = document.querySelector('.extrato-container') as HTMLElement;
      if (!element) {
        throw new Error('Elemento do extrato não encontrado');
      }

      // Clonar o elemento para aplicar estilos específicos do PDF
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '100%';
      clone.style.maxWidth = '800px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000';
      clone.style.fontFamily = 'Arial, sans-serif';
      clone.style.fontSize = '12px';
      clone.style.lineHeight = '1.4';
      clone.style.margin = '0';
      clone.style.padding = '20px';
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.visibility = 'visible';
      clone.style.display = 'block';

      // Preservar estilos originais das tabelas
      const tableElements = clone.querySelectorAll('table');
      tableElements.forEach(table => {
        (table as HTMLElement).style.width = '100%';
        (table as HTMLElement).style.borderCollapse = 'collapse';
        (table as HTMLElement).style.fontSize = '11px';
        (table as HTMLElement).style.marginBottom = '20px';
        (table as HTMLElement).style.border = 'none';
      });

      // Preservar estilos dos cabeçalhos
      const thElements = clone.querySelectorAll('th');
      thElements.forEach(th => {
        (th as HTMLElement).style.backgroundColor = '#f8f9fa';
        (th as HTMLElement).style.borderBottom = 'none';
        (th as HTMLElement).style.padding = '12px 8px';
        (th as HTMLElement).style.fontWeight = 'bold';
        (th as HTMLElement).style.textAlign = 'left';
        (th as HTMLElement).style.fontSize = '11px';
        (th as HTMLElement).style.border = 'none';
      });

      // Preservar estilos das células
      const tdElements = clone.querySelectorAll('td');
      tdElements.forEach(td => {
        (td as HTMLElement).style.borderBottom = 'none';
        (td as HTMLElement).style.padding = '10px 8px';
        (td as HTMLElement).style.fontSize = '11px';
        (td as HTMLElement).style.verticalAlign = 'top';
        (td as HTMLElement).style.border = 'none';
      });

      // Preservar estilos dos títulos das seções
      const sectionTitles = clone.querySelectorAll('.section-title th');
      sectionTitles.forEach(title => {
        (title as HTMLElement).style.backgroundColor = '#e9ecef';
        (title as HTMLElement).style.fontSize = '12px';
        (title as HTMLElement).style.fontWeight = 'bold';
        (title as HTMLElement).style.padding = '15px 8px 15px 43px'; // 35px + 8px padrão
        (title as HTMLElement).style.borderBottom = 'none';
        (title as HTMLElement).style.border = 'none';
      });

      // Preservar estilos das linhas de total
      const totalRows = clone.querySelectorAll('.total-row td');
      totalRows.forEach(td => {
        (td as HTMLElement).style.backgroundColor = '#f8f9fa';
        (td as HTMLElement).style.fontWeight = 'bold';
        (td as HTMLElement).style.borderTop = 'none';
        (td as HTMLElement).style.fontSize = '11px';
        (td as HTMLElement).style.border = 'none';
      });

      // Preservar estilos dos campos de detalhes
      const detailGrid = clone.querySelectorAll('.detail-grid');
      detailGrid.forEach(grid => {
        (grid as HTMLElement).style.marginBottom = '20px';
        (grid as HTMLElement).style.padding = '15px';
        (grid as HTMLElement).style.backgroundColor = '#f8f9fa';
        (grid as HTMLElement).style.borderRadius = '5px';
        (grid as HTMLElement).style.border = 'none';
      });

      const detailItems = clone.querySelectorAll('.detail-item');
      detailItems.forEach(item => {
        (item as HTMLElement).style.marginBottom = '10px';
        (item as HTMLElement).style.display = 'flex';
        (item as HTMLElement).style.alignItems = 'center';
        (item as HTMLElement).style.border = 'none';
      });

      const detailLabels = clone.querySelectorAll('.detail-label');
      detailLabels.forEach(label => {
        (label as HTMLElement).style.minWidth = '120px';
        (label as HTMLElement).style.fontWeight = 'bold';
        (label as HTMLElement).style.marginRight = '10px';
        (label as HTMLElement).style.fontSize = '11px';
        (label as HTMLElement).style.textAlign = 'right';
        (label as HTMLElement).style.border = 'none';
      });

      const detailValues = clone.querySelectorAll('.detail-value');
      detailValues.forEach(value => {
        (value as HTMLElement).style.fontSize = '11px';
        (value as HTMLElement).style.color = '#495057';
        (value as HTMLElement).style.border = 'none';
      });

      // Preservar estilos específicos do HTML
      const currencyCells = clone.querySelectorAll('.currency');
      currencyCells.forEach(cell => {
        (cell as HTMLElement).style.textAlign = 'right';
        (cell as HTMLElement).style.fontFamily = 'monospace';
        (cell as HTMLElement).style.fontSize = '11px';
      });

      // Preservar estilos dos botões (ocultar no PDF)
      const buttons = clone.querySelectorAll('button');
      buttons.forEach(button => {
        (button as HTMLElement).style.display = 'none';
      });

      // Preservar estilos dos ícones
      const icons = clone.querySelectorAll('i');
      icons.forEach(icon => {
        (icon as HTMLElement).style.display = 'none';
      });

      // Adicionar o clone ao DOM temporariamente
      document.body.appendChild(clone);

      // Aguardar um momento para o DOM ser renderizado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capturar o elemento com html2canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: clone.offsetWidth,
        windowHeight: clone.offsetHeight,
        foreignObjectRendering: false,
        removeContainer: true,
        logging: false
      });

      // Gerar PDF com jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Configurações otimizadas para preservar layout
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Primeira página
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Remover o clone do DOM
      document.body.removeChild(clone);

      // Download do PDF
      const fileName = `extrato-${this.getDataGeracao().replace(/\//g, '-')}.pdf`;
      
      // Usar serviço otimizado para WebView
      const pdfBlob = pdf.output('blob');
      const success = await this.webViewDownloadService.downloadPDF(pdfBlob, fileName);

      if (!success) {
        // Fallback para download direto
        pdf.save(fileName);
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Erro ao gerar PDF corporativo:', error);
      this.error.set('Erro ao gerar PDF corporativo. Tente novamente.');
      this.isLoading.set(false);
    }
  }

  // Método para gerar CSV
  async converterParaCSV(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const csvContent = this.gerarConteudoCSV();
      const fileName = `extrato-${this.getDataGeracao().replace(/\//g, '-')}.csv`;
      
      // Usar serviço otimizado para WebView
      const success = await this.webViewDownloadService.downloadCSV(csvContent, fileName);

      if (!success) {
        // Fallback para download direto
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(csvBlob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      this.error.set('Erro ao gerar CSV. Tente novamente.');
      this.isLoading.set(false);
    }
  }

  // Método para gerar HTML
  async gerarHTML(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const element = document.querySelector('.extrato-container') as HTMLElement;
      if (!element) {
        throw new Error('Elemento do extrato não encontrado');
      }

      const htmlContent = element.outerHTML;
      const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Extrato Bancário - Bradesco Corporate</title>
          <style>
              ${this.getCSSStyles()}
          </style>
      </head>
      <body>
          ${htmlContent}
      </body>
      </html>`;

      const fileName = `extrato-bancario-${new Date().toISOString().split('T')[0]}.html`;
      
      // Usar serviço otimizado para WebView
      const success = await this.webViewDownloadService.downloadHTML(fullHtml, fileName);

      if (!success) {
        // Fallback para download direto
        const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(htmlBlob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Erro ao gerar HTML:', error);
      this.error.set('Erro ao gerar HTML. Tente novamente.');
      this.isLoading.set(false);
    }
  }

  // Método para converter dados para CSV
  private gerarConteudoCSV(): string {
    const headers = [
      'Seção',
      'Data aplic.',
      'Data vencto.',
      'Resgate/Carência',
      'Taxa (%)',
      'Valor princ. (BRL)',
      'Valor Bruto (BRL)',
      'Renda total (BRL)',
      'IOF (BRL)',
      'IRRF (BRL)',
      'Valor Líquido (BRL)',
      'Renda bruta per'
    ];

    let csvContent = headers.join(';') + '\n';

    const rendaFixaData = this.rendaFixaData();
    if (!rendaFixaData) return csvContent;

    // Adicionar dados do saldo anterior
    if (rendaFixaData.rendaFixa.saldoAnterior && rendaFixaData.rendaFixa.saldoAnterior.length > 0) {
      csvContent += `"Saldo anterior em ${rendaFixaData.rendaFixa.dataSaldoAnterior}"\n`;
      rendaFixaData.rendaFixa.saldoAnterior.forEach((item: any) => {
        csvContent += this.itemParaCSV(item, 'Saldo Anterior') + '\n';
      });
      csvContent += this.totaisParaCSV(rendaFixaData.rendaFixa.saldoAteriorTotal, 'Saldo Anterior') + '\n';
    }

    // Adicionar dados das aplicações
    if (rendaFixaData.rendaFixa.aplicacao) {
      csvContent += '"Aplicações"\n';
      csvContent += this.itemParaCSV(rendaFixaData.rendaFixa.aplicacao, 'Aplicações') + '\n';
      csvContent += this.totaisParaCSV(rendaFixaData.rendaFixa.aplicacaoTotal, 'Aplicações') + '\n';
    }

    // Adicionar dados dos resgates
    if (rendaFixaData.rendaFixa.resgate && rendaFixaData.rendaFixa.resgate.length > 0) {
      csvContent += '"Resgates/Vencimentos"\n';
      rendaFixaData.rendaFixa.resgate.forEach((item: any) => {
        csvContent += this.itemParaCSV(item, 'Resgates') + '\n';
      });
      csvContent += this.totaisParaCSV(rendaFixaData.rendaFixa.resgateTotal, 'Resgates') + '\n';
    }

    // Adicionar dados do saldo final
    if (rendaFixaData.rendaFixa.saldoFinal && rendaFixaData.rendaFixa.saldoFinal.length > 0) {
      csvContent += `"Saldo final em ${rendaFixaData.rendaFixa.dataSaldoFinal}"\n`;
      rendaFixaData.rendaFixa.saldoFinal.forEach((item: any) => {
        csvContent += this.itemParaCSV(item, 'Saldo Final') + '\n';
      });
      csvContent += this.totaisParaCSV(rendaFixaData.rendaFixa.saldoFinalTotal, 'Saldo Final') + '\n';
    }

    return csvContent;
  }

  // Método para converter item para CSV
  private itemParaCSV(item: any, secao: string): string {
    return [
      secao,
      item.dataAplicacao,
      item.dataVencimento,
      item.datasResgate || item.dataResgate || '-',
      item.taxa ? item.taxa + '%' : '-',
      this.formatarMoeda(item.valorPrincipal),
      this.formatarMoeda(item.valorBruto),
      this.formatarMoeda(item.rendaTotal),
      this.formatarMoeda(item.iof),
      this.formatarMoeda(item.irrf),
      this.formatarMoeda(item.valoLiquido || item.valorLiquido),
      this.formatarMoeda(item.rendaBruta)
    ].join(';');
  }

  // Método para converter totais para CSV
  private totaisParaCSV(secao: any, nomeSecao: string): string {
    return [
      `${nomeSecao} - Total`,
      '',
      '',
      '',
      '',
      this.formatarMoeda(secao.valorPrincipal),
      this.formatarMoeda(secao.valorBruto),
      this.formatarMoeda(secao.rendaTotal),
      this.formatarMoeda(secao.iof),
      this.formatarMoeda(secao.irrf),
      this.formatarMoeda(secao.valoLiquido || secao.valorLiquido),
      this.formatarMoeda(secao.rendaBruta)
    ].join(';');
  }

  // Método para obter estilos CSS
  private getCSSStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #000;
        background: #ffffff;
      }

      .extrato-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 25px;
        background: #ffffff;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        line-height: 1.3;
        color: #000;
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
        margin-bottom: 25px;
        padding-bottom: 15px;
        position: relative;
        column-gap: 230px;
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
        font-size: 12px;
        color: #ffffff;
        background-color: #000;
        padding: 4px 8px;
        display: inline-block;
        border-radius: 2px;
        text-transform: none;
        font-weight: normal;
      }

      .header-right {
        display: flex;
        flex-direction: column;
        margin-left: auto;
      }

      .report-title {
        font-size: 12px;
        font-weight: 600;
        color: #000;
        margin-bottom: 5px;
      }

      .transaction-details {
        font-size: 12px;
        color: #000;
        font-weight: 600;
        line-height: 1.4;
      }

      .transaction-details div {
        margin-bottom: 2px;
        font-weight: 600;
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
      .financial-table td:nth-child(10),
      .financial-table th:nth-child(11),
      .financial-table td:nth-child(11) {
        text-align: right !important;
        padding-right: 3px !important;
      }

      .financial-table th:nth-child(11),
      .financial-table td:nth-child(11) {
        padding-right: 10px !important;
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

      .action-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
        flex-wrap: wrap;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }

      .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        min-width: 140px;
        justify-content: center;
      }

      .btn-primary {
        background: #001e61;
        color: #ffffff;
      }

      .btn-secondary {
        background: #39AED9;
        color: #ffffff;
      }

      .btn-success {
        background: #36BA9B;
        color: #ffffff;
      }

      .btn-info {
        background: #F5B946;
        color: #555555;
      }

      .btn-outline {
        background: transparent;
        color: #001e61;
        border: 2px solid #001e61;
      }

      .btn-icon {
        font-size: 1.1rem;
      }

      .btn-text {
        font-weight: 500;
      }
    `;
  }

  // Método para voltar para home
  voltarParaHome(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

