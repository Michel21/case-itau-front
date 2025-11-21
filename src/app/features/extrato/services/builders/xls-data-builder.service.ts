import { Injectable } from '@angular/core';
import * as XLSXStyle from 'xlsx-js-style';
import { IXLSDataBuilder, DocumentConfig, ExtratoData } from '../interfaces/extrato-generator-clean.interfaces';
import { DataFormatterService } from '../formatters/data-formatter.service';
import { RENDA_FIXA_DATA } from '../../../../../../data/mock-extrato.data';

/**
 * Serviço responsável exclusivamente por construção de dados XLS
 * Segue o Single Responsibility Principle (SRP)
 */
@Injectable({
  providedIn: 'root'
})
export class XLSDataBuilderService implements IXLSDataBuilder {

  constructor(private readonly dataFormatter: DataFormatterService) {}

  /**
   * Constrói os dados da planilha XLS
   */
  buildXLSData(data: ExtratoData, config: DocumentConfig): any[][] {
    const dados: any[][] = [];
    const rendaFixa = RENDA_FIXA_DATA.rendaFixa;

    // Seções da planilha
    this.addHeaderSection(dados);
    this.addEmptyRows(dados, 5);
    this.addTitleSection(dados);
    this.addTransactionDateSection(dados);
    this.addEmptyRows(dados, 1);
    this.addSearchDetailsSection(dados, config);
    this.addBasicDataSection(dados, rendaFixa);
    this.addEmptyRows(dados, 1);
    this.addTableHeaderSection(dados);
    this.addPreviousBalanceSection(dados, rendaFixa);
    this.addApplicationsSection(dados, rendaFixa);
    this.addRedemptionsSection(dados, rendaFixa);
    this.addTaxReductionSection(dados);
    this.addFinalBalanceSection(dados, rendaFixa);

    return dados;
  }

  /**
   * Aplica formatação à planilha XLS
   */
  applyXLSFormatting(worksheet: any, dados: any[][]): void {
    this.setColumnWidths(worksheet);
    this.applyGeneralFormatting(worksheet, dados);
    this.applyMerges(worksheet, dados);
    this.setWorksheetRange(worksheet, dados);
  }

  /**
   * Adiciona imagem ao workbook
   * @param workbook - Workbook do Excel
   * @param imageData - Dados da imagem em base64 ou URL
   * @param sheetName - Nome da planilha
   * @param position - Posição da imagem (célula de referência)
   */
  addImageToWorkbook(
    workbook: any,
    imageData: string,
    sheetName: string = 'Extrato',
    position: { col: number; row: number; width?: number; height?: number } = { col: 0, row: 0 }
  ): void {
    try {
      // Verificar se o workbook já tem a propriedade de imagens
      if (!workbook.Sheets[sheetName]['!images']) {
        workbook.Sheets[sheetName]['!images'] = [];
      }

      // Configuração padrão da imagem
      const imageConfig = {
        name: 'logo.png',
        data: imageData,
        opts: {
          base64: imageData.startsWith('data:image') || imageData.startsWith('iVBOR'),
        },
        position: {
          type: 'twoCellAnchor',
          attrs: { editAs: 'oneCell' },
          from: {
            col: position.col,
            row: position.row
          },
          to: {
            col: position.col + (position.width || 2),
            row: position.row + (position.height || 3)
          }
        }
      };

      // Adicionar imagem ao workbook
      workbook.Sheets[sheetName]['!images'].push(imageConfig);
      
      console.log('✅ Imagem adicionada ao XLS com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar imagem ao XLS:', error);
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - CONSTRUÇÃO DE SEÇÕES
  // ============================================================================

  /**
   * Adiciona seção do cabeçalho Bradesco
   * Nota: A imagem será adicionada separadamente via addImageToWorkbook()
   */
  private addHeaderSection(dados: any[][]): void {
    // Deixar espaço para logo (linhas 0-4)
    dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']); // Linha 0
    dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']); // Linha 1
    dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']); // Linha 2
    dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']); // Linha 3
    dados.push(['bradesco empresas e negócios', '', '', '', '', '', '', '', '', '', '', '', '']); // Linha 4
  }

  /**
   * Adiciona linhas vazias
   */
  private addEmptyRows(dados: any[][], count: number): void {
    for (let i = 0; i < count; i++) {
      dados.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);
    }
  }

  /**
   * Adiciona seção do título
   */
  private addTitleSection(dados: any[][]): void {
    dados.push(['Saldo e Extrato', '', '', '', '', '', '', '', '', '', '', '', '']);
  }

  /**
   * Adiciona seção da data da transação
   */
  private addTransactionDateSection(dados: any[][]): void {
    const dataAtual = this.dataFormatter.formatDateTime(new Date());
    dados.push(['Data da transação:', dataAtual, '', '', '', '', '', '', '', '', '', '', '']);
  }

  /**
   * Adiciona seção de detalhes da pesquisa
   */
  private addSearchDetailsSection(dados: any[][], config: DocumentConfig): void {
    dados.push(['Detalhes da Pesquisa', '', '', '', '', '', '', '', '', '', '', '', '']);
  }

  /**
   * Adiciona seção de dados básicos
   */
  private addBasicDataSection(dados: any[][], rendaFixa: any): void {
    const dataBusca = this.formatSearchDate(rendaFixa.dataSaldoAnterior);
    
    dados.push(['Agência | Conta:', '', '2 | 35108-3', '', '', '', '', '', '', '', '', '', '']);
    dados.push(['Data da busca:', '', dataBusca, '', '', '', '', '', '', '', '', '', '']);
    dados.push(['Tipo de investimento:', '', 'Fundos de Investimentos', '', '', '', '', '', '', '', '', '', '']);
    dados.push(['Tipo de Produto:', '', 'Bradesco FIC FI RF Referenciado DI Max', '', '', '', '', '', '', '', '', '', '']);
  }

  /**
   * Adiciona cabeçalho da tabela
   */
  private addTableHeaderSection(dados: any[][]): void {
    dados.push([
      'Data aplicação',
      'Resgate/Carência',
      'Quantidade de Cotas',
      'Valor princ. (BRL)',
      'Valor da Cota',
      'Valor Brut.',
      'Renda tot.',
      'IOF (BRL)',
      'IRRF (BRL)',
      'Valor Líqu',
      'Renda bruta per',
      '',
      ''
    ]);
  }

  /**
   * Adiciona seção de saldo anterior
   */
  private addPreviousBalanceSection(dados: any[][], rendaFixa: any): void {
    const dataSaldoAnterior = this.dataFormatter.formatDate(
      this.dataFormatter.convertBrazilianDate(rendaFixa.dataSaldoAnterior)
    );
    
    dados.push(['', `Saldo anterior em ${dataSaldoAnterior}`, '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.saldoAnterior && rendaFixa.saldoAnterior.length > 0) {
      const saldoAnt = rendaFixa.saldoAnterior[0];
      
      dados.push([
        this.dataFormatter.formatDate(this.dataFormatter.convertBrazilianDate(saldoAnt.dataAplicacao)),
        '50.450.472430000',
        '',
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.valorPrincipal),
        '649615000',
        this.dataFormatter.formatCurrency(saldoAnt.valorBruto),
        this.dataFormatter.formatCurrency(saldoAnt.rendaTotal),
        this.dataFormatter.formatCurrency(saldoAnt.iof),
        this.dataFormatter.formatCurrency(saldoAnt.irrf),
        this.dataFormatter.formatCurrency(saldoAnt.valoLiquido),
        '',
        '',
        ''
      ]);

      dados.push([
        'Total',
        '50.450.472430000',
        '',
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.valorPrincipal),
        '',
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.valorBruto),
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.rendaTotal),
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.iof),
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.irrf),
        this.dataFormatter.formatCurrency(rendaFixa.saldoAteriorTotal.valoLiquido),
        '',
        '',
        ''
      ]);
    }
  }

  /**
   * Adiciona seção de aplicações
   */
  private addApplicationsSection(dados: any[][], rendaFixa: any): void {
    dados.push(['', 'Aplicações', '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.aplicacao && rendaFixa.aplicacao.length > 0) {
      rendaFixa.aplicacao.forEach((aplicacao: any) => {
        dados.push([
          this.dataFormatter.formatDate(this.dataFormatter.convertBrazilianDate(aplicacao.dataAplicacao)),
          '',
          '',
          this.dataFormatter.formatCurrency(aplicacao.valorPrincipal),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ]);
      });
    }
    
    dados.push([
      'Total',
      '',
      '',
      this.dataFormatter.formatCurrency(rendaFixa.aplicacaoTotal.valorPrincipal),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ]);
  }

  /**
   * Adiciona seção de resgates/vencimentos
   */
  private addRedemptionsSection(dados: any[][], rendaFixa: any): void {
    dados.push(['', 'Resgates/Vencimentos', '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.resgate && rendaFixa.resgate.length > 0) {
      rendaFixa.resgate.forEach((resgate: any) => {
        dados.push([
          this.dataFormatter.formatDate(this.dataFormatter.convertBrazilianDate(resgate.dataAplicacao)),
          '',
          '',
          this.dataFormatter.formatCurrency(resgate.valorPrincipal),
          '',
          this.dataFormatter.formatCurrency(resgate.valorBruto),
          this.dataFormatter.formatCurrency(resgate.rendaTotal),
          this.dataFormatter.formatCurrency(resgate.iof),
          this.dataFormatter.formatCurrency(resgate.irrf),
          this.dataFormatter.formatCurrency(resgate.valoLiquido),
          '',
          '',
          ''
        ]);
      });
    }
    
    dados.push([
      'Total',
      '',
      '',
      this.dataFormatter.formatCurrency(rendaFixa.resgateTotal.valorPrincipal),
      '',
      this.dataFormatter.formatCurrency(rendaFixa.resgateTotal.valorBruto),
      this.dataFormatter.formatCurrency(rendaFixa.resgateTotal.rendaTotal),
      this.dataFormatter.formatCurrency(rendaFixa.resgateTotal.iof),
      this.dataFormatter.formatCurrency(rendaFixa.resgateTotal.irrf),
      this.dataFormatter.formatCurrency(rendaFixa.resgateTotal.valoLiquido),
      '',
      '',
      ''
    ]);
  }

  /**
   * Adiciona seção de redução de cotas
   */
  private addTaxReductionSection(dados: any[][]): void {
    dados.push(['', 'Redução de cotas - Recolhimento de IR conforme legislação vigente', '', '', '', '', '', '', '', '', '', '', '']);
    
    dados.push([
      'Total',
      '',
      '',
      '0,00',
      '',
      '0,00',
      '0,00',
      '0,00',
      '0,00',
      '0,00',
      '',
      '',
      ''
    ]);
  }

  /**
   * Adiciona seção de saldo final
   */
  private addFinalBalanceSection(dados: any[][], rendaFixa: any): void {
    const dataSaldoFinal = this.dataFormatter.formatDate(
      this.dataFormatter.convertBrazilianDate(rendaFixa.dataSaldoFinal)
    );
    
    dados.push(['', `Saldo final em ${dataSaldoFinal}`, '', '', '', '', '', '', '', '', '', '', '']);
    
    if (rendaFixa.saldoFinal && rendaFixa.saldoFinal.length > 0) {
      const saldoFin = rendaFixa.saldoFinal[0];
      
      dados.push([
        this.dataFormatter.formatDate(this.dataFormatter.convertBrazilianDate(saldoFin.dataAplicacao)),
        '50.450.472430000',
        '',
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.valorPrincipal),
        '668052000',
        this.dataFormatter.formatCurrency(saldoFin.valorBruto),
        this.dataFormatter.formatCurrency(saldoFin.rendaTotal),
        this.dataFormatter.formatCurrency(saldoFin.iof),
        this.dataFormatter.formatCurrency(saldoFin.irrf),
        this.dataFormatter.formatCurrency(saldoFin.valoLiquido),
        this.dataFormatter.formatCurrency(saldoFin.rendaBruta),
        '',
        ''
      ]);

      dados.push([
        'Total',
        '50.450.472430000',
        '',
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.valorPrincipal),
        '',
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.valorBruto),
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.rendaTotal),
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.iof),
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.irrf),
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.valoLiquido),
        this.dataFormatter.formatCurrency(rendaFixa.saldoFinalTotal.rendaBruta),
        '',
        ''
      ]);
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - FORMATAÇÃO
  // ============================================================================

  /**
   * Define larguras das colunas
   */
  private setColumnWidths(worksheet: any): void {
    const colWidths = [
      { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 13 },
      { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 5 }, { wch: 5 }
    ];
    worksheet['!cols'] = colWidths;
  }

  /**
   * Aplica formatação geral às células
   */
  private applyGeneralFormatting(worksheet: any, dados: any[][]): void {
    for (let row = 0; row < dados.length; row++) {
      for (let col = 0; col < dados[row].length; col++) {
        const cellAddress = XLSXStyle.utils.encode_cell({ r: row, c: col });
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: dados[row][col] };
        }

        this.applyCellFormatting(worksheet, cellAddress, row, col, dados);
      }
    }
  }

  /**
   * Aplica formatação específica a uma célula
   */
  private applyCellFormatting(worksheet: any, cellAddress: string, row: number, col: number, dados: any[][]): void {
    // Header Bradesco (linhas 0-1, colunas A-B)
    if (row <= 1 && col <= 1) {
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: '003366' } },
        font: { 
          color: { rgb: 'FFFFFF' }, 
          bold: true, 
          sz: row === 0 ? 14 : 12 
        },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
    // Título principal (linha 7)
    else if (row === 7 && col === 0) {
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
    // Data da transação (linha 8)
    else if (row === 8) {
      worksheet[cellAddress].s = {
        font: { bold: false, sz: 11 },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
    // Detalhes da Pesquisa (linha 10)
    else if (row === 10) {
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: 'E8E8E8' } },
        font: { bold: true, sz: 11 }
      };
    }
    // Header da tabela (linha 16)
    else if (row === 16) {
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: 'C0C0C0' } },
        font: { bold: true, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
    // Títulos das seções na coluna B
    else if (col === 1 && this.isSectionTitle(dados[row][col])) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
    // Valores monetários (alinhados à direita)
    else if (this.isMonetaryColumn(col) && dados[row][col] !== '' && !this.isSectionTitle(dados[row][col])) {
      worksheet[cellAddress].s = {
        alignment: { horizontal: 'right' }
      };
    }
    // Totais (negrito)
    else if (dados[row][0] === 'Total') {
      worksheet[cellAddress].s = {
        font: { bold: true }
      };
    }
  }

  /**
   * Aplica mesclagens às células
   */
  private applyMerges(worksheet: any, dados: any[][]): void {
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    
    // Header Bradesco
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
    worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });
    
    // Detalhes da Pesquisa
    worksheet['!merges'].push({ s: { r: 10, c: 0 }, e: { r: 10, c: 12 } });

    // Títulos das seções (mesclagem dinâmica)
    this.applyDynamicMerges(worksheet, dados);
  }

  /**
   * Aplica mesclagens dinâmicas para títulos de seções
   */
  private applyDynamicMerges(worksheet: any, dados: any[][]): void {
    for (let row = 0; row < dados.length; row++) {
      if (dados[row][1] && this.isSectionTitle(dados[row][1])) {
        worksheet['!merges'].push({ s: { r: row, c: 1 }, e: { r: row, c: 12 } });
      }
    }
  }

  /**
   * Define o range da planilha
   */
  private setWorksheetRange(worksheet: any, dados: any[][]): void {
    const range = XLSXStyle.utils.decode_range(worksheet['!ref'] || 'A1');
    range.e.c = Math.max(range.e.c, 12);
    range.e.r = Math.max(range.e.r, dados.length - 1);
    worksheet['!ref'] = XLSXStyle.utils.encode_range(range);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - UTILITÁRIOS
  // ============================================================================

  /**
   * Formata data de busca para formato brasileiro por extenso
   */
  private formatSearchDate(dataBr: string): string {
    const date = this.dataFormatter.convertBrazilianDate(dataBr);
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[date.getMonth()]}/${date.getFullYear()}`;
  }

  /**
   * Verifica se o texto é um título de seção
   */
  private isSectionTitle(text: string): boolean {
    if (!text) return false;
    
    return text.includes('Saldo anterior em') ||
           text === 'Aplicações' ||
           text === 'Resgates/Vencimentos' ||
           text === 'Redução de cotas - Recolhimento de IR conforme legislação vigente' ||
           text.includes('Saldo final em');
  }

  /**
   * Verifica se a coluna contém valores monetários
   */
  private isMonetaryColumn(col: number): boolean {
    return [1, 3, 4, 5, 6, 7, 8, 9].includes(col);
  }
}
