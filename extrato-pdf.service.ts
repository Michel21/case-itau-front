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
      // Tentar usar jsPDF se disponível
      await this.gerarPDFComJsPDF(dados, config);
    } catch (error) {
      console.error('Erro ao gerar PDF com jsPDF, usando fallback:', error);
      // Fallback para print se jsPDF não estiver disponível
      this.gerarPDFPrint();
    }
  }

  /**
   * Gera PDF usando jsPDF com layout corporativo
   */
  private async gerarPDFComJsPDF(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    try {
      // Verificar se jsPDF está disponível globalmente
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const jsPDF = (window as any).jsPDF;
        await this.criarPDFComJsPDF(jsPDF, dados, config);
      } else {
        // Tentar importar dinamicamente
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default;
        await this.criarPDFComJsPDF(jsPDF, dados, config);
      }
    } catch (error) {
      console.error('Erro ao importar jsPDF:', error);
      throw new Error('jsPDF não está disponível. Use o botão "Imprimir PDF" como alternativa.');
    }
  }

  /**
   * Cria PDF usando jsPDF
   */
  private async criarPDFComJsPDF(jsPDF: any, dados: ExtratoDados, config: PDFConfig): Promise<void> {
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
   * Gera arquivo CSV com formatação melhorada
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
   * Converte dados para formato CSV com formatação melhorada
   */
  private converterParaCSV(dados: ExtratoDados): string {
    // Cabeçalho principal
    let csv = 'EXTRATO BANCÁRIO - BRADESCO CORPORATE\n';
    csv += 'Global Solutions\n';
    csv += `Data da transação: ${dados.dataBusca}\n`;
    csv += `Empresa: ${dados.empresa}\n`;
    csv += `Agência/Conta: ${dados.agencia}\n`;
    csv += `Tipo de investimento: ${dados.tipoInvestimento}\n`;
    csv += `Tipo de produto: ${dados.tipoProduto}\n\n`;

    // Cabeçalho da tabela
    csv += 'Seção,Data Aplicação,Data Vencimento,Data Resgate,Taxa (%),Valor Principal (R$),Valor Bruto (R$),Renda Total (R$),IOF (R$),IRRF (R$),Valor Líquido (R$),Renda Bruta Per (R$)\n';

    // Saldo Anterior
    if (dados.saldoAnterior?.itens) {
      csv += `\nSALDO ANTERIOR em ${dados.saldoAnterior.dataSaldo}\n`;
      dados.saldoAnterior.itens.forEach(item => {
        csv += this.itemParaCSV('Saldo Anterior', item);
      });
      csv += this.totaisParaCSV('Saldo Anterior', dados.saldoAnterior);
    }

    // Aplicações
    if (dados.aplicacoes?.itens) {
      csv += '\nAPLICAÇÕES\n';
      dados.aplicacoes.itens.forEach(item => {
        csv += this.itemParaCSV('Aplicações', item);
      });
      csv += this.totaisParaCSV('Aplicações', dados.aplicacoes);
    }

    // Resgates
    if (dados.resgates?.itens) {
      csv += '\nRESGATES/VENCIMENTOS\n';
      dados.resgates.itens.forEach(item => {
        csv += this.itemParaCSV('Resgates', item);
      });
      csv += this.totaisParaCSV('Resgates', dados.resgates);
    }

    // Saldo Final
    if (dados.saldoFinal?.itens) {
      csv += `\nSALDO FINAL em ${dados.saldoFinal.dataSaldo}\n`;
      dados.saldoFinal.itens.forEach(item => {
        csv += this.itemParaCSV('Saldo Final', item);
      });
      csv += this.totaisParaCSV('Saldo Final', dados.saldoFinal);
    }

    // Rodapé
    csv += '\nDocumento gerado automaticamente pelo sistema Bradesco Corporate\n';
    csv += 'Para dúvidas, entre em contato com seu gerente de relacionamento\n';

    return csv;
  }

  /**
   * Converte item para linha CSV com formatação melhorada
   */
  private itemParaCSV(secao: string, item: ExtratoItem): string {
    const formatarNumero = (valor: number) => {
      return valor.toFixed(2).replace('.', ',');
    };

    return `"${secao}","${item.dataAplicacao}","${item.dataVencimento}","${item.dataResgate}","${formatarNumero(item.taxa)}","${formatarNumero(item.valorPrincipal)}","${formatarNumero(item.valorBruto)}","${formatarNumero(item.rendaTotal)}","${formatarNumero(item.iof)}","${formatarNumero(item.irrf)}","${formatarNumero(item.valorLiquido)}","${formatarNumero(item.rendaBrutaPer)}"\n`;
  }

  /**
   * Converte totais para linha CSV com formatação melhorada
   */
  private totaisParaCSV(secao: string, dados: ExtratoSecao): string {
    const formatarNumero = (valor: number) => {
      return valor.toFixed(2).replace('.', ',');
    };

    return `"${secao} - TOTAL","","","","","${formatarNumero(dados.totalValorPrincipal)}","${formatarNumero(dados.totalValorBruto)}","${formatarNumero(dados.totalRendaTotal)}","${formatarNumero(dados.totalIof)}","${formatarNumero(dados.totalIrrf)}","${formatarNumero(dados.totalValorLiquido)}","${formatarNumero(dados.totalRendaBrutaPer)}"\n`;
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
