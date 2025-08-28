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
   * Gera PDF corporativo com fallback robusto
   */
  async gerarPDFCorporativo(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    try {
      // Tenta usar jsPDF se disponível
      await this.gerarPDFComJsPDF(dados, config);
    } catch (error) {
      console.warn('jsPDF não disponível, usando impressão do navegador:', error);
      // Fallback para impressão do navegador com formatação corporativa
      this.gerarPDFPrintCorporativo(dados, config);
    }
  }

  /**
   * Gera PDF usando jsPDF (se disponível)
   */
  private async gerarPDFComJsPDF(dados: ExtratoDados, config: PDFConfig): Promise<void> {
    let jsPDF: any;
    
    // Tenta encontrar jsPDF globalmente primeiro
    if ((window as any).jsPDF) {
      jsPDF = (window as any).jsPDF;
    } else {
      // Tenta importação dinâmica
      try {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      } catch (importError) {
        throw new Error('jsPDF não está disponível. Execute: npm install jspdf html2canvas');
      }
    }

    if (!jsPDF) {
      throw new Error('jsPDF não pôde ser carregado');
    }

    // Cria o PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Adiciona cabeçalho corporativo
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BRADESCO CORPORATE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Global Solutions', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SALDO E EXTRATO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Adiciona informações do relatório
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMAÇÕES DO RELATÓRIO', margin, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data da transação: ${dados.dataBusca}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Número de controle: ${config.numeroControle}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Hora de geração: ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition);
    yPosition += 10;

    // Adiciona detalhes da empresa
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALHES DA PESQUISA', margin, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Empresa: ${dados.empresa}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Agência/Conta: ${dados.agencia}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tipo de investimento: ${dados.tipoInvestimento}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tipo de produto: ${dados.tipoProduto}`, margin, yPosition);
    yPosition += 15;

    // Adiciona dados do extrato
    this.adicionarSecaoPDF(pdf, dados, 'SALDO ANTERIOR', dados.saldoAnterior, margin, yPosition);
    yPosition += 40;
    
    this.adicionarSecaoPDF(pdf, dados, 'APLICAÇÕES', dados.aplicacoes, margin, yPosition);
    yPosition += 40;
    
    this.adicionarSecaoPDF(pdf, dados, 'RESGATES/VENCIMENTOS', dados.resgates, margin, yPosition);
    yPosition += 40;
    
    this.adicionarSecaoPDF(pdf, dados, 'SALDO FINAL', dados.saldoFinal, margin, yPosition);

    // Adiciona rodapé corporativo
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Documento gerado automaticamente pelo sistema Bradesco Corporate', pageWidth / 2, pageHeight - 20, { align: 'center' });
    pdf.text('Este documento é confidencial e de uso interno da empresa', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Bradesco Corporate - Global Solutions', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Salva o PDF
    const fileName = `extrato_bradesco_${dados.dataBusca.replace(/\//g, '')}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Adiciona seção ao PDF usando jsPDF
   */
  private adicionarSecaoPDF(pdf: any, dados: ExtratoDados, titulo: string, secao: ExtratoSecao | null, margin: number, yPosition: number): void {
    if (!secao?.itens || secao.itens.length === 0) return;

    // Título da seção
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${titulo}${secao.dataSaldo ? ` em ${secao.dataSaldo}` : ''}`, margin, yPosition);
    yPosition += 8;

    // Cabeçalho da tabela
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const headers = ['Data Aplic.', 'Data Vencto.', 'Data Resgate', 'Taxa (%)', 'Valor Princ.', 'Valor Bruto', 'Renda Total', 'IOF', 'IRRF', 'Valor Líquido', 'Renda Bruta'];
    const colWidths = [20, 20, 20, 15, 25, 25, 25, 15, 15, 25, 25];
    
    let xPosition = margin;
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 6;

    // Dados da seção
    pdf.setFont('helvetica', 'normal');
    secao.itens.forEach(item => {
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
  }

  /**
   * Gera PDF corporativo usando impressão do navegador
   */
  private gerarPDFPrintCorporativo(dados: ExtratoDados, config: PDFConfig): void {
    // Cria uma nova janela com o conteúdo formatado
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up bloqueado. Permita pop-ups para gerar o PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Extrato Bradesco Corporate</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #666; margin-bottom: 5px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #0066cc; }
            .info-row { margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            .table th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
            .page-break { page-break-before: always; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">BRADESCO CORPORATE</div>
          <div class="subtitle">Global Solutions</div>
          <div class="title">SALDO E EXTRATO</div>
        </div>

        <div class="section">
          <div class="section-title">INFORMAÇÕES DO RELATÓRIO</div>
          <div class="info-row">Data da transação: ${dados.dataBusca}</div>
          <div class="info-row">Número de controle: ${config.numeroControle}</div>
          <div class="info-row">Data de geração: ${new Date().toLocaleDateString('pt-BR')}</div>
          <div class="info-row">Hora de geração: ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>

        <div class="section">
          <div class="section-title">DETALHES DA PESQUISA</div>
          <div class="info-row">Empresa: ${dados.empresa}</div>
          <div class="info-row">Agência/Conta: ${dados.agencia}</div>
          <div class="info-row">Tipo de investimento: ${dados.tipoInvestimento}</div>
          <div class="info-row">Tipo de produto: ${dados.tipoProduto}</div>
        </div>

        ${this.gerarHTMLSecao('SALDO ANTERIOR', dados.saldoAnterior)}
        ${this.gerarHTMLSecao('APLICAÇÕES', dados.aplicacoes)}
        ${this.gerarHTMLSecao('RESGATES/VENCIMENTOS', dados.resgates)}
        ${this.gerarHTMLSecao('SALDO FINAL', dados.saldoFinal)}

        <div class="footer">
          <div>Documento gerado automaticamente pelo sistema Bradesco Corporate</div>
          <div>Este documento é confidencial e de uso interno da empresa</div>
          <div>Para dúvidas, entre em contato com seu gerente de relacionamento</div>
          <div>Bradesco Corporate - Global Solutions</div>
          <div>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguarda o carregamento e imprime
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  /**
   * Gera HTML para uma seção do extrato
   */
  private gerarHTMLSecao(titulo: string, secao: ExtratoSecao | null): string {
    if (!secao?.itens || secao.itens.length === 0) return '';

    return `
      <div class="section">
        <div class="section-title">${titulo}${secao.dataSaldo ? ` em ${secao.dataSaldo}` : ''}</div>
        <table class="table">
          <thead>
            <tr>
              <th>Data Aplicação</th>
              <th>Data Vencimento</th>
              <th>Data Resgate</th>
              <th>Taxa (%)</th>
              <th>Valor Principal (R$)</th>
              <th>Valor Bruto (R$)</th>
              <th>Renda Total (R$)</th>
              <th>IOF (R$)</th>
              <th>IRRF (R$)</th>
              <th>Valor Líquido (R$)</th>
              <th>Renda Bruta Per (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${secao.itens.map(item => `
              <tr>
                <td>${this.formatarData(item.dataAplicacao)}</td>
                <td>${this.formatarData(item.dataVencimento)}</td>
                <td>${this.formatarData(item.dataResgate)}</td>
                <td>${item.taxa.toFixed(2).replace('.', ',')}</td>
                <td>${this.formatarMoeda(item.valorPrincipal)}</td>
                <td>${this.formatarMoeda(item.valorBruto)}</td>
                <td>${this.formatarMoeda(item.rendaTotal)}</td>
                <td>${this.formatarMoeda(item.iof)}</td>
                <td>${this.formatarMoeda(item.irrf)}</td>
                <td>${this.formatarMoeda(item.valorLiquido)}</td>
                <td>${this.formatarMoeda(item.rendaBrutaPer)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5"><strong>${titulo} - TOTAL</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalValorPrincipal)}</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalValorBruto)}</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalRendaTotal)}</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalIof)}</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalIrrf)}</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalValorLiquido)}</strong></td>
              <td><strong>${this.formatarMoeda(secao.totalRendaBrutaPer)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
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
   * Converte dados para formato CSV com padrão corporativo
   */
  private converterParaCSV(dados: ExtratoDados): string {
    // Cabeçalho corporativo
    let csv = 'BRADESCO CORPORATE\n';
    csv += 'Global Solutions\n';
    csv += 'SALDO E EXTRATO\n';
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
    csv += `Empresa | CNPJ: ${dados.empresa}\n`;
    csv += `Agência | Conta: ${dados.agencia}\n`;
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
    csv += this.gerarResumoExecutivo(dados);
    
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
   * Gera resumo executivo dos dados
   */
  private gerarResumoExecutivo(dados: ExtratoDados): string {
    let resumo = '';
    
    // Totais por seção
    const totais = {
      saldoAnterior: dados.saldoAnterior?.totalValorLiquido || 0,
      aplicacoes: dados.aplicacoes?.totalValorLiquido || 0,
      resgates: dados.resgates?.totalValorLiquido || 0,
      saldoFinal: dados.saldoFinal?.totalValorLiquido || 0
    };

    resumo += `Saldo Anterior Total: R$ ${this.formatarMoedaCSV(totais.saldoAnterior)}\n`;
    resumo += `Aplicações Total: R$ ${this.formatarMoedaCSV(totais.aplicacoes)}\n`;
    resumo += `Resgates Total: R$ ${this.formatarMoedaCSV(totais.resgates)}\n`;
    resumo += `Saldo Final Total: R$ ${this.formatarMoedaCSV(totais.saldoFinal)}\n\n`;
    
    // Variação
    const variacao = totais.saldoFinal - totais.saldoAnterior;
    const percentualVariacao = totais.saldoAnterior > 0 ? (variacao / totais.saldoAnterior) * 100 : 0;
    
    resumo += `Variação do Período: R$ ${this.formatarMoedaCSV(variacao)}\n`;
    resumo += `Percentual de Variação: ${percentualVariacao.toFixed(2).replace('.', ',')}%\n`;
    
    return resumo;
  }

  /**
   * Formata moeda para CSV
   */
  private formatarMoedaCSV(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
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
