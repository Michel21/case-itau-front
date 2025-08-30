import { Component, Input, OnInit, signal, computed, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Interfaces
export interface ExtratoItem {
  dataAplicacao: string;
  dataVencimento: string;
  dataResgate?: string;
  taxa?: number;
  valorPrincipal?: number;
  valorBruto?: number;
  rendaTotal?: number;
  iof?: number;
  irrf?: number;
  valorLiquido?: number;
  rendaBrutaPer?: number;
}

export interface ExtratoTotais {
  valorPrincipal?: number;
  valorBruto?: number;
  rendaTotal?: number;
  iof?: number;
  irrf?: number;
  valorLiquido?: number;
  rendaBrutaPer?: number;
}

export interface ExtratoSecao {
  dataSaldo?: string;
  itens: ExtratoItem[];
  totalValorPrincipal?: number;
  totalValorBruto?: number;
  totalRendaTotal?: number;
  totalIof?: number;
  totalIrrf?: number;
  totalValorLiquido?: number;
  totalRendaBrutaPer?: number;
}

export interface ExtratoDados {
  empresa: string;
  agencia: string;
  dataBusca: string;
  tipoInvestimento: string;
  tipoProduto: string;
  saldoAnterior?: ExtratoSecao;
  aplicacoes?: ExtratoSecao;
  resgates?: ExtratoSecao;
  saldoFinal?: ExtratoSecao;
}

export interface ExtratoConfig {
  titulo: string;
  dataTransacao: string;
  numeroControle: string;
  empresa: string;
  agencia: string;
  dataBusca: string;
  tipoInvestimento: string;
  tipoProduto: string;
}

@Component({
  selector: 'app-extrato-pdf',
  templateUrl: './extrato-pdf.component.html',
  styleUrls: ['./extrato-pdf.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtratoPdfComponent implements OnInit, OnDestroy {
  @Input() extratoData: ExtratoDados | null = null;

  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals
  public readonly dadosAtuais = signal<ExtratoDados | null>(null);
  public readonly config = signal<ExtratoConfig | null>(null);
  public readonly isLoading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly isPrintMode = signal(false);

  // Computed values
  public readonly temSaldoAnterior = computed(() => this.temItens(this.dadosAtuais()?.saldoAnterior));
  public readonly temAplicacoes = computed(() => this.temItens(this.dadosAtuais()?.aplicacoes));
  public readonly temResgates = computed(() => this.temItens(this.dadosAtuais()?.resgates));
  public readonly temSaldoFinal = computed(() => this.temItens(this.dadosAtuais()?.saldoFinal));

  // Dados mock para teste
  private readonly mockData: ExtratoDados = {
    empresa: '49.320.901 LUCIANO RAMOS | 49.320.901/0001-50',
    agencia: '1221 | 35394-9',
    dataBusca: 'Agosto/2025',
    tipoInvestimento: 'CDB - Certificado de Depósito Bancário',
    tipoProduto: 'Invest Facil Bradesco',
    saldoAnterior: {
      dataSaldo: '31/07/2025',
      itens: [
        {
          dataAplicacao: '10/03/2025',
          dataVencimento: '01/03/2027',
          dataResgate: '',
          taxa: 0,
          valorPrincipal: 58.22,
          valorBruto: 58.37,
          rendaTotal: 0.15,
          iof: 0.00,
          irrf: 0.03,
          valorLiquido: 58.34,
          rendaBrutaPer: 0
        },
        {
          dataAplicacao: '31/03/2025',
          dataVencimento: '22/03/2027',
          dataResgate: '',
          taxa: 5.00,
          valorPrincipal: 90.12,
          valorBruto: 90.32,
          rendaTotal: 0.20,
          iof: 0.00,
          irrf: 0.04,
          valorLiquido: 0,
          rendaBrutaPer: 0
        },
        {
          dataAplicacao: '23/05/2025',
          dataVencimento: '07/05/2024',
          dataResgate: '',
          taxa: 0,
          valorPrincipal: 1005.40,
          valorBruto: 1005.48,
          rendaTotal: 0.08,
          iof: 0.00,
          irrf: 0.29,
          valorLiquido: 1005.11,
          rendaBrutaPer: 0
        }
      ],
      totalValorPrincipal: 1153.74,
      totalValorBruto: 1154.17,
      totalRendaTotal: 0.43,
      totalIof: 0.00,
      totalIrrf: 0.36,
      totalValorLiquido: 0,
      totalRendaBrutaPer: 0
    },
    aplicacoes: {
      itens: [
        {
          dataAplicacao: '04/08/2025',
          dataVencimento: '26/07/2027',
          dataResgate: '',
          taxa: 0,
          valorPrincipal: 0,
          valorBruto: 0,
          rendaTotal: 0,
          iof: 0,
          irrf: 0,
          valorLiquido: 0,
          rendaBrutaPer: 0
        },
        {
          dataAplicacao: '05/08/2025',
          dataVencimento: '05/08/2027',
          dataResgate: '',
          taxa: 0,
          valorPrincipal: 100.00,
          valorBruto: 0,
          rendaTotal: 0,
          iof: 0,
          irrf: 0,
          valorLiquido: 0,
          rendaBrutaPer: 0
        }
      ],
      totalValorPrincipal: 100.00,
      totalValorBruto: 0,
      totalRendaTotal: 0,
      totalIof: 0,
      totalIrrf: 0,
      totalValorLiquido: 0,
      totalRendaBrutaPer: 0
    },
    resgates: {
      itens: [
        {
          dataAplicacao: '10/03/2025',
          dataVencimento: '01/03/2027',
          dataResgate: '05/08/2025',
          taxa: 5.00,
          valorPrincipal: 58.22,
          valorBruto: 58.37,
          rendaTotal: 0.15,
          iof: 0.00,
          irrf: 0.03,
          valorLiquido: 58.34,
          rendaBrutaPer: 0.00
        },
        {
          dataAplicacao: '28/08/2025',
          dataVencimento: '07/06/2027',
          dataResgate: '',
          taxa: 5.00,
          valorPrincipal: 44.56,
          valorBruto: 44.67,
          rendaTotal: 0.11,
          iof: 0.00,
          irrf: 0.13,
          valorLiquido: 44.54,
          rendaBrutaPer: 0.00
        }
      ],
      totalValorPrincipal: 102.78,
      totalValorBruto: 103.04,
      totalRendaTotal: 0.26,
      totalIof: 0.00,
      totalIrrf: 0.16,
      totalValorLiquido: 0,
      totalRendaBrutaPer: 0
    }
  };

  ngOnInit(): void {
    const data = this.extratoData || this.mockData;
    this.dadosAtuais.set(data);
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
  }

  // Utility methods
  private temItens(secao: ExtratoSecao | undefined): boolean {
    return secao !== undefined && secao.itens.length > 0;
  }

  private gerarNumeroControle(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.substring(0, 20);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para gerar PDF usando impressão do navegador
  gerarPDF(): void {
    this.isPrintMode.set(true);
    
    setTimeout(() => {
      window.print();
      this.isPrintMode.set(false);
    }, 100);
  }

  // Método para gerar PDF corporativo usando jsPDF
  async gerarPDFCorporativo(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      const element = document.getElementById('extrato-container');
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `extrato-bancario-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.error.set('Erro ao gerar PDF. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Método para gerar CSV
  gerarCSV(): void {
    try {
      const csvContent = this.converterParaCSV();
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato-bancario-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('CSV gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      this.error.set('Erro ao gerar CSV. Tente novamente.');
    }
  }

  // Método para exportar HTML
  exportarHTML(): void {
    try {
      const element = document.getElementById('extrato-container');
      if (!element) {
        throw new Error('Elemento não encontrado');
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
      
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato-bancario-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('HTML exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar HTML:', error);
      this.error.set('Erro ao exportar HTML. Tente novamente.');
    }
  }

  // Método para converter dados para CSV
  private converterParaCSV(): string {
    const headers = [
      'Seção',
      'Data Aplicação',
      'Data Vencimento',
      'Data Resgate',
      'Taxa (%)',
      'Valor Principal (BRL)',
      'Valor Bruto (BRL)',
      'Renda Total (BRL)',
      'IOF (BRL)',
      'IRRF (BRL)',
      'Valor Líquido (BRL)',
      'Renda Bruta Per (BRL)'
    ];

    let csvContent = headers.join(';') + '\n';

    const dados = this.dadosAtuais();
    if (!dados) return csvContent;

    // Adicionar dados do saldo anterior
    if (dados.saldoAnterior && dados.saldoAnterior.itens.length > 0) {
      csvContent += `"Saldo anterior em ${dados.saldoAnterior.dataSaldo}"\n`;
      dados.saldoAnterior.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Saldo Anterior') + '\n';
      });
      csvContent += this.totaisParaCSV(dados.saldoAnterior, 'Saldo Anterior') + '\n';
    }

    // Adicionar dados das aplicações
    if (dados.aplicacoes && dados.aplicacoes.itens.length > 0) {
      csvContent += '"Aplicações"\n';
      dados.aplicacoes.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Aplicações') + '\n';
      });
      csvContent += this.totaisParaCSV(dados.aplicacoes, 'Aplicações') + '\n';
    }

    // Adicionar dados dos resgates
    if (dados.resgates && dados.resgates.itens.length > 0) {
      csvContent += '"Resgates/Vencimentos"\n';
      dados.resgates.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Resgates') + '\n';
      });
      csvContent += this.totaisParaCSV(dados.resgates, 'Resgates') + '\n';
    }

    // Adicionar dados do saldo final
    if (dados.saldoFinal && dados.saldoFinal.itens.length > 0) {
      csvContent += `"Saldo final em ${dados.saldoFinal.dataSaldo}"\n`;
      dados.saldoFinal.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Saldo Final') + '\n';
      });
      csvContent += this.totaisParaCSV(dados.saldoFinal, 'Saldo Final') + '\n';
    }

    return csvContent;
  }

  // Método para converter item para CSV
  private itemParaCSV(item: ExtratoItem, secao: string): string {
    return [
      secao,
      item.dataAplicacao,
      item.dataVencimento,
      item.dataResgate || '',
      item.taxa?.toString() || '',
      this.formatarMoeda(item.valorPrincipal),
      this.formatarMoeda(item.valorBruto),
      this.formatarMoeda(item.rendaTotal),
      this.formatarMoeda(item.iof),
      this.formatarMoeda(item.irrf),
      this.formatarMoeda(item.valorLiquido),
      this.formatarMoeda(item.rendaBrutaPer)
    ].join(';');
  }

  // Método para converter totais para CSV
  private totaisParaCSV(secao: ExtratoSecao, nomeSecao: string): string {
    return [
      `${nomeSecao} - Total`,
      '',
      '',
      '',
      '',
      this.formatarMoeda(secao.totalValorPrincipal),
      this.formatarMoeda(secao.totalValorBruto),
      this.formatarMoeda(secao.totalRendaTotal),
      this.formatarMoeda(secao.totalIof),
      this.formatarMoeda(secao.totalIrrf),
      this.formatarMoeda(secao.totalValorLiquido),
      this.formatarMoeda(secao.totalRendaBrutaPer)
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
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #555555;
        background: #ffffff;
      }

      .extrato-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
        background: #ffffff;
        min-height: 100vh;
      }

      .extrato-header {
        background: linear-gradient(135deg, #001e61 0%, #5887da 100%);
        color: #ffffff;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .main-title {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
      }

      .search-details {
        background: #f4f4f9;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #001e61;
        margin: 0 0 1.5rem 0;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .detail-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: #ffffff;
        border-radius: 8px;
        border-left: 4px solid #001e61;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .detail-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #555555;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 1rem;
        font-weight: 500;
        color: #001e61;
        word-break: break-word;
      }

      .table-container {
        overflow-x: auto;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        background: #ffffff;
        margin-bottom: 2rem;
      }

      .financial-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        min-width: 1000px;
      }

      .table-header {
        background: #001e61;
        color: #ffffff;
      }

      .table-header th {
        padding: 1rem 0.75rem;
        text-align: center;
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #5887da;
      }

      .section-title {
        background: #f4f4f9;
        color: #001e61;
      }

      .section-title th {
        padding: 1rem 0.75rem;
        text-align: left;
        font-weight: 700;
        font-size: 1rem;
        border-bottom: 2px solid #001e61;
      }

      .data-row {
        border-bottom: 1px solid #dbdbdb;
      }

      .data-row td {
        padding: 0.75rem 0.5rem;
        text-align: center;
        vertical-align: middle;
      }

      .total-row {
        background: #001e61;
        color: #ffffff;
        font-weight: 700;
      }

      .total-row td {
        padding: 1rem 0.5rem;
        text-align: center;
        border-top: 2px solid #5887da;
      }

      .currency {
        font-family: 'Courier New', monospace;
        font-weight: 500;
        text-align: right;
      }

      .action-buttons {
        display: none;
      }

      @media print {
        .action-buttons {
          display: none !important;
        }
      }
    `;
  }

  // Public methods
  public getNumeroControle(): string {
    return this.config()?.numeroControle || '';
  }

  public getDataGeracao(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  public getHoraGeracao(): string {
    return new Date().toLocaleTimeString('pt-BR');
  }

  // Format methods
  public formatarMoeda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '';
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  public formatarPorcentagem(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '';
    return `${valor.toFixed(2)}%`;
  }

  public formatarData(data: string | null | undefined): string {
    if (!data) return '';
    return data;
  }

  public temValor(valor: any): boolean {
    return valor !== null && valor !== undefined && valor !== '';
  }

  // Navigation methods
  public voltarParaHome(): void {
    this.router.navigate(['/home']);
  }
}

