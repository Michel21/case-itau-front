import { Injectable } from '@angular/core';

// Interfaces para tipagem
export interface ExtratoItem {
  dataAplicacao: string;
  dataVencimento: string;
  dataResgate: string;
  taxa: number;
  valorPrincipal: number;
  valorBruto: number;
  rendaTotal: number;
  iof: number;
  irrf: number;
  valorLiquido: number;
  rendaBrutaPer: number;
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
  totalRendaBrutaPer: number;
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

  constructor() { }

  /**
   * Gera PDF corporativo usando jsPDF
   */
  async gerarPDFCorporativo(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    try {
      // Verificar se jsPDF está disponível
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        await this.gerarPDFComJsPDF(dados, config);
      } else {
        // Fallback para print se jsPDF não estiver disponível
        this.gerarPDFPrint();
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para print
      this.gerarPDFPrint();
    }
  }

  /**
   * Gera PDF usando jsPDF com layout corporativo
   */
  private async gerarPDFComJsPDF(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    try {
      // Importar jsPDF dinamicamente
      const jsPDF = (await import('jspdf')).default;

      // Configurar PDF corporativo
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Configurar fonte e cores corporativas
      pdf.setFont('helvetica');
      pdf.setFontSize(12);

      // Cabeçalho corporativo
      this.adicionarCabecalhoPDF(pdf, config, margin, pageWidth);

      // Informações do relatório
      this.adicionarInformacoesRelatorio(pdf, config, margin);

      // Detalhes da empresa
      this.adicionarDetalhesEmpresa(pdf, dados, margin);

      // Gerar tabela de dados
      let yPosition = 140;
      yPosition = this.adicionarSecaoPDF(pdf, 'SALDO ANTERIOR', dados.saldoAnterior, yPosition, pageWidth, margin);
      yPosition = this.adicionarSecaoPDF(pdf, 'APLICAÇÕES', dados.aplicacoes, yPosition, pageWidth, margin);
      yPosition = this.adicionarSecaoPDF(pdf, 'RESGATES/VENCIMENTOS', dados.resgates, yPosition, pageWidth, margin);
      yPosition = this.adicionarSecaoPDF(pdf, 'SALDO FINAL', dados.saldoFinal, yPosition, pageWidth, margin);

      // Rodapé corporativo
      this.adicionarRodapePDF(pdf, margin, pageHeight);

      // Salvar PDF
      pdf.save(config.fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF com jsPDF:', error);
      throw error;
    }
  }

  /**
   * Adiciona cabeçalho corporativo ao PDF
   */
  private adicionarCabecalhoPDF(pdf: any, config: PDFConfig, margin: number, pageWidth: number): void {
    pdf.setFillColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(config.title, margin, 25);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(config.subtitle, margin, 32);
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, 40, pageWidth - margin, 40);
  }

  /**
   * Adiciona informações do relatório ao PDF
   */
  private adicionarInformacoesRelatorio(pdf: any, config: PDFConfig, margin: number): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SALDO E EXTRATO', margin, 55);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data da transação: ${config.dataTransacao}`, margin, 65);
    pdf.text(`Número de controle: ${config.numeroControle}`, margin, 72);
  }

  /**
   * Adiciona detalhes da empresa ao PDF
   */
  private adicionarDetalhesEmpresa(pdf: any, dados: ExtratoDados, margin: number): void {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALHES DA PESQUISA', margin, 85);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Empresa | CNPJ: ${dados.empresa}`, margin, 95);
    pdf.text(`Agência | Conta: ${dados.agencia}`, margin, 102);
    pdf.text(`Data da busca: ${dados.dataBusca}`, margin, 109);
    pdf.text(`Tipo de investimento: ${dados.tipoInvestimento}`, margin, 116);
    pdf.text(`Tipo de Produto: ${dados.tipoProduto}`, margin, 123);
  }

  /**
   * Adiciona rodapé corporativo ao PDF
   */
  private adicionarRodapePDF(pdf: any, margin: number, pageHeight: number): void {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Documento gerado automaticamente pelo sistema Bradesco Corporate', margin, pageHeight - 20);
    pdf.text('Para dúvidas, entre em contato com seu gerente de relacionamento', margin, pageHeight - 15);
  }

  /**
   * Adiciona seção de dados ao PDF
   */
  private adicionarSecaoPDF(pdf: any, titulo: string, secao: ExtratoSecao | undefined, yPosition: number, pageWidth: number, margin: number): number {
    if (!secao || !secao.itens || secao.itens.length === 0) {
      return yPosition;
    }

    // Verificar se precisa de nova página
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Título da seção
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    pdf.text(titulo, margin + 2, yPosition);

    yPosition += 15;

    // Cabeçalho da tabela
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    const colWidths = [20, 20, 20, 15, 25, 25, 25, 15, 15, 25, 25];
    const headers = ['Data Aplic.', 'Data Vencto.', 'Resgate/Carência', 'Taxa (%)', 'Valor Princ.', 'Valor Bruto', 'Renda Total', 'IOF', 'IRRF', 'Valor Líquido', 'Renda Bruta'];
    
    let xPosition = margin;
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    yPosition += 8;

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

      yPosition += 6;
    });

    // Total da seção
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    xPosition = margin;
    pdf.text('TOTAL', xPosition, yPosition);
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
   * Gera PDF usando print do navegador
   */
  gerarPDFPrint(): void {
    // Esconder botões antes de imprimir
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'none';
    }

    // Imprimir
    window.print();

    // Restaurar botões após um delay
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

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.fileName.replace('.pdf', '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Gera arquivo CSV
   */
  gerarCSV(dados: ExtratoDados, config: PDFConfig): void {
    const BOM = '\uFEFF';
    const csvContent = BOM + this.converterParaCSV(dados);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.fileName.replace('.pdf', '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Converte dados para formato CSV
   */
  private converterParaCSV(dados: ExtratoDados): string {
    let csv = 'Secao,Data Aplicacao,Data Vencimento,Data Resgate,Taxa (%),Valor Principal,Valor Bruto,Renda Total,IOF,IRRF,Valor Liquido,Renda Bruta Per\n';

    // Saldo Anterior
    if (dados.saldoAnterior?.itens) {
      dados.saldoAnterior.itens.forEach(item => {
        csv += this.itemParaCSV('Saldo Anterior', item);
      });
      csv += this.totaisParaCSV('Saldo Anterior', dados.saldoAnterior);
    }

    // Aplicações
    if (dados.aplicacoes?.itens) {
      dados.aplicacoes.itens.forEach(item => {
        csv += this.itemParaCSV('Aplicacoes', item);
      });
      csv += this.totaisParaCSV('Aplicacoes', dados.aplicacoes);
    }

    // Resgates
    if (dados.resgates?.itens) {
      dados.resgates.itens.forEach(item => {
        csv += this.itemParaCSV('Resgates', item);
      });
      csv += this.totaisParaCSV('Resgates', dados.resgates);
    }

    // Saldo Final
    if (dados.saldoFinal?.itens) {
      dados.saldoFinal.itens.forEach(item => {
        csv += this.itemParaCSV('Saldo Final', item);
      });
      csv += this.totaisParaCSV('Saldo Final', dados.saldoFinal);
    }

    return csv;
  }

  /**
   * Converte item para linha CSV
   */
  private itemParaCSV(secao: string, item: ExtratoItem): string {
    return `${secao},${item.dataAplicacao},${item.dataVencimento},${item.dataResgate},${item.taxa.toFixed(2).replace('.', ',')},${item.valorPrincipal.toFixed(2).replace('.', ',')},${item.valorBruto.toFixed(2).replace('.', ',')},${item.rendaTotal.toFixed(2).replace('.', ',')},${item.iof.toFixed(2).replace('.', ',')},${item.irrf.toFixed(2).replace('.', ',')},${item.valorLiquido.toFixed(2).replace('.', ',')},${item.rendaBrutaPer.toFixed(2).replace('.', ',')}\n`;
  }

  /**
   * Converte totais para linha CSV
   */
  private totaisParaCSV(secao: string, dados: ExtratoSecao): string {
    return `${secao} - TOTAL,,,,${dados.totalValorPrincipal.toFixed(2).replace('.', ',')},${dados.totalValorBruto.toFixed(2).replace('.', ',')},${dados.totalRendaTotal.toFixed(2).replace('.', ',')},${dados.totalIof.toFixed(2).replace('.', ',')},${dados.totalIrrf.toFixed(2).replace('.', ',')},${dados.totalValorLiquido.toFixed(2).replace('.', ',')},${dados.totalRendaBrutaPer.toFixed(2).replace('.', ',')}\n`;
  }

  /**
   * Obtém estilos CSS para exportação HTML
   */
  private getCSSStyles(): string {
    const styleSheets = Array.from(document.styleSheets);
    let cssText = '';
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules);
        rules.forEach(rule => {
          cssText += rule.cssText + '\n';
        });
      } catch (e) {
        // Ignorar erros de CORS
      }
    });
    
    return cssText;
  }

  /**
   * Formata data para exibição
   */
  private formatarData(data: string): string {
    return data;
  }

  /**
   * Formata valor monetário para exibição
   */
  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Cria configuração padrão para PDF
   */
  criarConfigPDF(dataTransacao: string, numeroControle: string): PDFConfig {
    return {
      title: 'BRADESCO CORPORATE',
      subtitle: 'Global Solutions',
      dataTransacao,
      numeroControle,
      fileName: `extrato_bradesco_${dataTransacao.replace(/\//g, '')}.pdf`
    };
  }
}
