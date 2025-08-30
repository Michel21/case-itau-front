import { Component, Input, OnInit } from '@angular/core';
// import { ExtratoCsvService, CSVConfig } from './extrato-csv.service';

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
  valorPrincipal: number;
  valorBruto: number;
  rendaTotal: number;
  iof: number;
  irrf: number;
  valorLiquido: number;
  rendaBrutaPer?: number;
}

export interface ExtratoSecao {
  dataSaldo?: string;
  itens: ExtratoItem[];
  totalValorPrincipal: number;
  totalValorBruto: number;
  totalRendaTotal: number;
  totalIof: number;
  totalIrrf: number;
  totalValorLiquido: number;
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

@Component({
  selector: 'app-extrato-pdf',
  templateUrl: './extrato-pdf.component.html',
  styleUrls: ['./extrato-pdf.component.css']
})
export class ExtratoPdfComponent implements OnInit {
  @Input() extratoData: ExtratoDados | null = null;

  // Dados mock para teste baseados no template
  mockData: ExtratoDados = {
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
          dataResgate: undefined,
          taxa: undefined,
          valorPrincipal: 58.22,
          valorBruto: 58.37,
          rendaTotal: 0.15,
          iof: 0.00,
          irrf: 0.03,
          valorLiquido: 58.34,
          rendaBrutaPer: undefined
        },
        {
          dataAplicacao: '31/03/2025',
          dataVencimento: '22/03/2027',
          dataResgate: undefined,
          taxa: 5.00,
          valorPrincipal: 90.12,
          valorBruto: 90.32,
          rendaTotal: 0.20,
          iof: 0.00,
          irrf: 0.04,
          valorLiquido: undefined,
          rendaBrutaPer: undefined
        },
        {
          dataAplicacao: '23/05/2025',
          dataVencimento: '07/05/2024',
          dataResgate: undefined,
          taxa: undefined,
          valorPrincipal: 1005.40,
          valorBruto: 1005.48,
          rendaTotal: 0.08,
          iof: 0.00,
          irrf: 0.29,
          valorLiquido: 1005.11,
          rendaBrutaPer: undefined
        }
      ],
      totalValorPrincipal: 2272.84,
      totalValorBruto: 2272.84,
      totalRendaTotal: 2275.27,
      totalIof: 0.00,
      totalIrrf: 0.52,
      totalValorLiquido: undefined,
      totalRendaBrutaPer: undefined
    },
    aplicacoes: {
      itens: [
        {
          dataAplicacao: '04/08/2025',
          dataVencimento: '26/07/2027',
          dataResgate: undefined,
          taxa: undefined,
          valorPrincipal: undefined,
          valorBruto: undefined,
          rendaTotal: undefined,
          iof: undefined,
          irrf: undefined,
          valorLiquido: undefined,
          rendaBrutaPer: undefined
        },
        {
          dataAplicacao: '05/08/2025',
          dataVencimento: '05/08/2027',
          dataResgate: undefined,
          taxa: undefined,
          valorPrincipal: 100.00,
          valorBruto: undefined,
          rendaTotal: undefined,
          iof: undefined,
          irrf: undefined,
          valorLiquido: undefined,
          rendaBrutaPer: undefined
        }
      ],
      totalValorPrincipal: 100.00,
      totalValorBruto: undefined,
      totalRendaTotal: undefined,
      totalIof: undefined,
      totalIrrf: undefined,
      totalValorLiquido: undefined,
      totalRendaBrutaPer: undefined
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
          dataAplicacao: '23/05/2025',
          dataVencimento: '13/05/2027',
          dataResgate: '26/06/2025',
          taxa: 5.00,
          valorPrincipal: 844.81,
          valorBruto: 845.46,
          rendaTotal: 0.65,
          iof: 0.00,
          irrf: 0.14,
          valorLiquido: 845.32,
          rendaBrutaPer: 0.08
        },
        {
          dataAplicacao: '26/06/2025',
          dataVencimento: '16/06/2027',
          dataResgate: '30/06/2025',
          taxa: 5.00,
          valorPrincipal: 29.06,
          valorBruto: 29.08,
          rendaTotal: 0.02,
          iof: 0.00,
          irrf: 0.01,
          valorLiquido: 29.07,
          rendaBrutaPer: 0.01
        }
      ],
      totalValorPrincipal: 2036.17,
      totalValorBruto: 2038.08,
      totalRendaTotal: 1.91,
      totalIof: 0.00,
      totalIrrf: 0.41,
      totalValorLiquido: 2037.67,
      totalRendaBrutaPer: 0.20
    },
    saldoFinal: {
      dataSaldo: '25/08/2025',
      itens: [
        {
          dataAplicacao: '28/08/2025',
          dataVencimento: '07/06/2027',
          dataResgate: undefined,
          taxa: 5.00,
          valorPrincipal: 44.56,
          valorBruto: 44.61,
          rendaTotal: 0.05,
          iof: 0.00,
          irrf: 0.01,
          valorLiquido: 44.60,
          rendaBrutaPer: 0.02
        }
      ],
      totalValorPrincipal: 2272.84,
      totalValorBruto: 2272.84,
      totalRendaTotal: 2275.27,
      totalIof: 0.00,
      totalIrrf: 0.52,
      totalValorLiquido: undefined,
      totalRendaBrutaPer: undefined
    }
  };

  dadosAtuais: ExtratoDados;
  dataTransacao: string;
  numeroControle: string;

  // Propriedades computadas para verificar se seções têm itens
  get temSaldoAnterior(): boolean {
    return this.temItens(this.dadosAtuais.saldoAnterior);
  }

  get temAplicacoes(): boolean {
    return this.temItens(this.dadosAtuais.aplicacoes);
  }

  get temResgates(): boolean {
    return this.temItens(this.dadosAtuais.resgates);
  }

  get temSaldoFinal(): boolean {
    return this.temItens(this.dadosAtuais.saldoFinal);
  }

  constructor(private csvService: ExtratoCsvService) {
    this.dadosAtuais = this.mockData;
    this.dataTransacao = new Date().toLocaleString('pt-BR');
    this.numeroControle = this.gerarNumeroControle();
  }

  ngOnInit(): void {
    if (this.extratoData) {
      this.dadosAtuais = this.extratoData;
    }
  }

  // Método para gerar PDF usando impressão do navegador
  gerarPDF(): void {
    // Esconde os botões antes de imprimir
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
      actionButtons.setAttribute('style', 'display: none !important');
    }
    
    window.print();
    
    // Restaura os botões após impressão
    setTimeout(() => {
      if (actionButtons) {
        actionButtons.removeAttribute('style');
      }
    }, 1000);
  }

  // Método para gerar PDF usando jsPDF (requer biblioteca)
  gerarPDFAvancado(): void {
    // Esta implementação requer a biblioteca jsPDF
    // Para usar, instale: npm install jspdf html2canvas
    console.log('Funcionalidade de PDF avançado requer jsPDF');
    
    // Exemplo de implementação:
    /*
    import jsPDF from 'jspdf';
    import html2canvas from 'html2canvas';
    
    const element = document.getElementById('extrato-container');
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
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
      
      pdf.save('extrato-bancario.pdf');
    });
    */
  }

  // Método para exportar como HTML
  exportarHTML(): void {
    const htmlContent = document.getElementById('extrato-container')?.innerHTML;
    if (htmlContent) {
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
    }
  }

  // Método para gerar CSV usando o serviço dedicado
  gerarCSV(): void {
    const config: CSVConfig = this.csvService.criarConfigCSV(this.dataTransacao);
    this.csvService.gerarCSV(this.dadosAtuais, config);
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

    // Adicionar dados do saldo anterior
    if (this.temSaldoAnterior) {
      csvContent += `"Saldo anterior em ${this.dadosAtuais.saldoAnterior?.dataSaldo}"\n`;
      this.dadosAtuais.saldoAnterior?.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Saldo Anterior') + '\n';
      });
      csvContent += this.totaisParaCSV(this.dadosAtuais.saldoAnterior, 'Saldo Anterior') + '\n';
    }

    // Adicionar dados das aplicações
    if (this.temAplicacoes) {
      csvContent += '"Aplicações"\n';
      this.dadosAtuais.aplicacoes?.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Aplicações') + '\n';
      });
      csvContent += this.totaisParaCSV(this.dadosAtuais.aplicacoes, 'Aplicações') + '\n';
    }

    // Adicionar dados dos resgates
    if (this.temResgates) {
      csvContent += '"Resgates/Vencimentos"\n';
      this.dadosAtuais.resgates?.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Resgates') + '\n';
      });
      csvContent += this.totaisParaCSV(this.dadosAtuais.resgates, 'Resgates') + '\n';
    }

    // Adicionar dados do saldo final
    if (this.temSaldoFinal) {
      csvContent += `"Saldo final em ${this.dadosAtuais.saldoFinal?.dataSaldo}"\n`;
      this.dadosAtuais.saldoFinal?.itens.forEach(item => {
        csvContent += this.itemParaCSV(item, 'Saldo Final') + '\n';
      });
      csvContent += this.totaisParaCSV(this.dadosAtuais.saldoFinal, 'Saldo Final') + '\n';
    }

    return csvContent;
  }

  // Método auxiliar para converter item para CSV
  private itemParaCSV(item: ExtratoItem, secao: string): string {
    return [
      secao,
      item.dataAplicacao || '',
      item.dataVencimento || '',
      item.dataResgate || '',
      item.taxa?.toFixed(2) || '',
      item.valorPrincipal?.toFixed(2) || '',
      item.valorBruto?.toFixed(2) || '',
      item.rendaTotal?.toFixed(2) || '',
      item.iof?.toFixed(2) || '',
      item.irrf?.toFixed(2) || '',
      item.valorLiquido?.toFixed(2) || '',
      item.rendaBrutaPer?.toFixed(2) || ''
    ].join(';');
  }

  // Método auxiliar para converter totais para CSV
  private totaisParaCSV(secao: ExtratoSecao | undefined, nomeSecao: string): string {
    if (!secao) return '';
    
    return [
      `${nomeSecao} - TOTAL`,
      '',
      '',
      '',
      '',
      secao.totalValorPrincipal?.toFixed(2) || '',
      secao.totalValorBruto?.toFixed(2) || '',
      secao.totalRendaTotal?.toFixed(2) || '',
      secao.totalIof?.toFixed(2) || '',
      secao.totalIrrf?.toFixed(2) || '',
      secao.totalValorLiquido?.toFixed(2) || '',
      secao.totalRendaBrutaPer?.toFixed(2) || ''
    ].join(';');
  }

  // Método para obter estilos CSS para exportação HTML
  private getCSSStyles(): string {
    return `
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
        font-size: 10px;
        border-bottom: 1px solid #eee;
      }

      .total-row {
        background-color: transparent !important;
        color: #000 !important;
        font-weight: bold;
        border-top: 1px solid #ddd !important;
        padding: 8px 0 !important;
        margin-bottom: 10px;
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

      .action-buttons {
        display: none;
      }
    `;
  }

  // Método para verificar se uma seção tem itens
  private temItens(secao: ExtratoSecao | undefined): boolean {
    return secao !== undefined && secao.itens.length > 0;
  }

  // Método para formatar valor monetário
  formatarMoeda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Método para formatar porcentagem
  formatarPorcentagem(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Método para formatar data
  formatarData(data: string | null | undefined): string {
    if (!data) return '';
    return data;
  }

  // Método para gerar número de controle
  private gerarNumeroControle(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Método para verificar se valor existe
  temValor(valor: any): boolean {
    return valor !== null && valor !== undefined && valor !== '';
  }
}

