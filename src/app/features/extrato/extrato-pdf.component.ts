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
      this.error.set(null);

      const element = document.querySelector('.extrato-container') as HTMLElement;
      if (!element) {
        throw new Error('Elemento do extrato não encontrado');
      }

      // Criar um clone do elemento para manipulação
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remover botões de ação do clone
      const actionButtons = clone.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.remove();
      }

      // Remover loading e error states
      const loadingOverlay = clone.querySelector('.loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.remove();
      }

      const errorMessage = clone.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.remove();
      }

      // Aplicar estilos específicos para PDF
      clone.style.width = '210mm';
      clone.style.margin = '0';
      clone.style.padding = '10mm';
      clone.style.backgroundColor = '#ffffff';
      clone.style.fontFamily = 'Arial, sans-serif';
      clone.style.fontSize = '10px';
      clone.style.lineHeight = '1.3';
      clone.style.color = '#000000';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.visibility = 'hidden';

      // Estilos específicos para o header
      const header = clone.querySelector('.extrato-header') as HTMLElement;
      if (header) {
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'flex-start';
        header.style.marginBottom = '25px';
        header.style.paddingBottom = '15px';
        header.style.position = 'relative';
        header.style.columnGap = '230px';
      }

      // Estilos para header-left
      const headerLeft = clone.querySelector('.header-left') as HTMLElement;
      if (headerLeft) {
        headerLeft.style.display = 'flex';
        headerLeft.style.flexDirection = 'column';
        headerLeft.style.justifyContent = 'flex-start';
        headerLeft.style.alignItems = 'flex-start';
      }

      // Estilos para logo
      const logo = clone.querySelector('.logo') as HTMLElement;
      if (logo) {
        logo.style.fontSize = '28px';
        logo.style.fontWeight = 'bold';
        logo.style.color = '#cc0000';
        logo.style.marginBottom = '2px';
        logo.style.textTransform = 'none';
      }

      // Estilos para subtitle
      const subtitle = clone.querySelector('.subtitle') as HTMLElement;
      if (subtitle) {
        subtitle.style.fontSize = '16px';
        subtitle.style.color = '#000';
        subtitle.style.marginBottom = '4px';
        subtitle.style.textTransform = 'none';
        subtitle.style.fontWeight = 'normal';
      }

      // Estilos para global-solutions
      const globalSolutions = clone.querySelector('.global-solutions') as HTMLElement;
      if (globalSolutions) {
        globalSolutions.style.fontSize = '12px';
        globalSolutions.style.color = '#ffffff';
        globalSolutions.style.backgroundColor = '#000';
        globalSolutions.style.padding = '4px 8px';
        globalSolutions.style.display = 'inline-block';
        globalSolutions.style.borderRadius = '2px';
        globalSolutions.style.textTransform = 'none';
        globalSolutions.style.fontWeight = 'normal';
      }

      // Estilos para header-right
      const headerRight = clone.querySelector('.header-right') as HTMLElement;
      if (headerRight) {
        headerRight.style.display = 'flex';
        headerRight.style.flexDirection = 'column';
        headerRight.style.marginLeft = 'auto';
      }

      // Estilos para report-title
      const reportTitle = clone.querySelector('.report-title') as HTMLElement;
      if (reportTitle) {
        reportTitle.style.fontSize = '12px';
        reportTitle.style.fontWeight = '600';
        reportTitle.style.color = '#000';
        reportTitle.style.marginBottom = '5px';
      }

      // Estilos para transaction-details
      const transactionDetails = clone.querySelector('.transaction-details') as HTMLElement;
      if (transactionDetails) {
        transactionDetails.style.fontSize = '12px';
        transactionDetails.style.color = '#000';
        transactionDetails.style.fontWeight = '600';
        transactionDetails.style.lineHeight = '1.4';
      }

      // Estilos para search-details
      const searchDetails = clone.querySelector('.search-details') as HTMLElement;
      if (searchDetails) {
        searchDetails.style.backgroundColor = '#fff';
        searchDetails.style.padding = '8px 0';
        searchDetails.style.border = 'none';
        searchDetails.style.marginBottom = '12px';
        searchDetails.style.borderRadius = '0';
      }

      // Estilos para h3 em search-details
      const searchDetailsH3 = clone.querySelector('.search-details h3') as HTMLElement;
      if (searchDetailsH3) {
        searchDetailsH3.style.color = '#000';
        searchDetailsH3.style.marginBottom = '6px';
        searchDetailsH3.style.fontSize = '14px';
        searchDetailsH3.style.fontWeight = 'bold';
      }

      // Estilos para detail-grid
      const detailGrid = clone.querySelector('.detail-grid') as HTMLElement;
      if (detailGrid) {
        detailGrid.style.display = 'block';
        detailGrid.style.gap = '0';
      }

      // Estilos para detail-item
      const detailItems = clone.querySelectorAll('.detail-item');
      detailItems.forEach(item => {
        (item as HTMLElement).style.display = 'block';
        (item as HTMLElement).style.padding = '1px 0';
        (item as HTMLElement).style.borderBottom = 'none';
        (item as HTMLElement).style.fontSize = '11px';
        (item as HTMLElement).style.marginBottom = '1px';
      });

      // Estilos para detail-label
      const detailLabels = clone.querySelectorAll('.detail-label');
      detailLabels.forEach(label => {
        (label as HTMLElement).style.fontWeight = 'bold';
        (label as HTMLElement).style.color = '#000';
        (label as HTMLElement).style.display = 'inline';
      });

      // Estilos para detail-value
      const detailValues = clone.querySelectorAll('.detail-value');
      detailValues.forEach(value => {
        (value as HTMLElement).style.color = '#000';
        (value as HTMLElement).style.display = 'inline';
      });

      // Estilos para financial-table
      const financialTable = clone.querySelector('.financial-table') as HTMLElement;
      if (financialTable) {
        financialTable.style.width = '100%';
        financialTable.style.borderCollapse = 'collapse';
        financialTable.style.backgroundColor = '#fff';
        financialTable.style.fontSize = '10px';
        financialTable.style.border = 'none';
      }

      // Estilos para table-header
      const tableHeaders = clone.querySelectorAll('.table-header');
      tableHeaders.forEach(header => {
        (header as HTMLElement).style.backgroundColor = '#ddd';
        (header as HTMLElement).style.padding = '12px 0';
      });

      // Estilos para th em financial-table
      const tableThs = clone.querySelectorAll('.financial-table th');
      tableThs.forEach((th, index) => {
        (th as HTMLElement).style.backgroundColor = 'transparent';
        (th as HTMLElement).style.color = '#000';
        (th as HTMLElement).style.padding = '8px 4px';
        (th as HTMLElement).style.textAlign = 'center';
        (th as HTMLElement).style.border = 'none';
        (th as HTMLElement).style.fontWeight = 'bold';
        (th as HTMLElement).style.fontSize = '11px';
        (th as HTMLElement).style.borderBottom = '1px solid #ccc';

        // Alinhamentos específicos baseados na posição
        if (index === 0) {
          (th as HTMLElement).style.textAlign = 'left';
          (th as HTMLElement).style.paddingLeft = '20px';
        } else if (index === 1 || index === 2) {
          (th as HTMLElement).style.textAlign = 'left';
          (th as HTMLElement).style.paddingLeft = '3px';
        } else if (index === 3) {
          (th as HTMLElement).style.textAlign = 'center';
        } else {
          (th as HTMLElement).style.textAlign = 'right';
          (th as HTMLElement).style.paddingRight = index === 10 ? '10px' : '3px';
        }
      });

      // Estilos para td em financial-table
      const tableTds = clone.querySelectorAll('.financial-table td');
      tableTds.forEach((td, index) => {
        (td as HTMLElement).style.padding = '6px 4px';
        (td as HTMLElement).style.textAlign = 'center';
        (td as HTMLElement).style.border = 'none';
        (td as HTMLElement).style.color = '#000';
        (td as HTMLElement).style.fontSize = '11px';
        (td as HTMLElement).style.borderBottom = '1px solid #eee';

        // Alinhamentos específicos baseados na posição
        if (index % 11 === 0) {
          (td as HTMLElement).style.textAlign = 'left';
          (td as HTMLElement).style.paddingLeft = '20px';
        } else if (index % 11 === 1 || index % 11 === 2) {
          (td as HTMLElement).style.textAlign = 'left';
          (td as HTMLElement).style.paddingLeft = '3px';
        } else if (index % 11 === 3) {
          (td as HTMLElement).style.textAlign = 'center';
        } else {
          (td as HTMLElement).style.textAlign = 'right';
          (td as HTMLElement).style.paddingRight = (index % 11 === 10) ? '10px' : '3px';
        }
      });

      // Estilos para section-title
      const sectionTitles = clone.querySelectorAll('.section-title');
      sectionTitles.forEach(title => {
        (title as HTMLElement).style.backgroundColor = '#eee';
        (title as HTMLElement).style.padding = '12px 0';
      });

      // Estilos para th em section-title
      const sectionTitleThs = clone.querySelectorAll('.section-title th');
      sectionTitleThs.forEach(th => {
        (th as HTMLElement).style.backgroundColor = '#eee';
        (th as HTMLElement).style.color = '#000';
        (th as HTMLElement).style.padding = '12px 35px';
        (th as HTMLElement).style.textAlign = 'left';
        (th as HTMLElement).style.fontWeight = 'bold';
        (th as HTMLElement).style.fontSize = '12px';
        (th as HTMLElement).style.borderBottom = '1px solid #ddd';
      });

      // Estilos para data-row
      const dataRows = clone.querySelectorAll('.data-row');
      dataRows.forEach(row => {
        (row as HTMLElement).style.backgroundColor = 'transparent';
      });

      // Estilos para total-row
      const totalRows = clone.querySelectorAll('.total-row');
      totalRows.forEach(row => {
        (row as HTMLElement).style.backgroundColor = 'transparent';
        (row as HTMLElement).style.color = '#000';
        (row as HTMLElement).style.fontWeight = 'bold';
        (row as HTMLElement).style.borderTop = '1px solid #ddd';
        (row as HTMLElement).style.padding = '8px 0';
        (row as HTMLElement).style.marginBottom = '10px';
      });

      // Estilos para td em total-row
      const totalRowTds = clone.querySelectorAll('.total-row td');
      totalRowTds.forEach((td, index) => {
        (td as HTMLElement).style.color = '#000';
        (td as HTMLElement).style.borderColor = 'transparent';
        (td as HTMLElement).style.borderBottom = 'none';
        (td as HTMLElement).style.padding = '8px 4px';

        // Alinhamentos específicos para total-row
        if (index === 0) {
          (td as HTMLElement).style.textAlign = 'left';
          (td as HTMLElement).style.paddingLeft = '0px';
        } else if (index === 1 || index === 2 || index === 3) {
          (td as HTMLElement).style.textAlign = 'center';
        } else {
          (td as HTMLElement).style.textAlign = 'right';
          (td as HTMLElement).style.paddingRight = (index === 10) ? '10px' : '3px';
        }
      });

      // Estilos para currency
      const currencyElements = clone.querySelectorAll('.currency');
      currencyElements.forEach(element => {
        (element as HTMLElement).style.fontFamily = "'Courier New', monospace";
        (element as HTMLElement).style.fontSize = '11px';
      });

      // Adicionar o clone ao DOM temporariamente
      document.body.appendChild(clone);

      // Aguardar um momento para o DOM ser renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturar o elemento com html2canvas
      const canvas = await html2canvas(clone, {
        scale: 1.2,
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
        removeContainer: true
      });

      // Remover o clone do DOM
      document.body.removeChild(clone);

      // Criar PDF com jsPDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190; // Largura menor para margens
      const pageHeight = 277; // Altura menor para margens
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10; // Margem superior

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10; // +10 para margem superior
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salvar o PDF
      const fileName = `extrato-bradesco-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      this.isLoading.set(false);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.error.set('Erro ao gerar PDF corporativo');
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

