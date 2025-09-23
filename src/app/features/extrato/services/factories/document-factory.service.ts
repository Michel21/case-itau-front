import { Injectable } from '@angular/core';
import { 
  IDocumentConfig, 
  IGenerationOptions, 
  ITableColumn, 
  ITableSection
} from '../interfaces/extrato-generator.interfaces';

/**
 * Factory para criação de objetos relacionados a documentos
 * Centraliza a criação e configuração de objetos complexos
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentFactoryService {
  
  /**
   * Cria configuração padrão de documento
   */
  createDocumentConfig(overrides: Partial<IDocumentConfig> = {}): IDocumentConfig {
    const defaultConfig: IDocumentConfig = {
      title: 'Extrato Bancário',
      company: 'Bradesco',
      agency: '0000',
      account: '00000-0',
      period: 'Último mês',
      generationDate: new Date(),
      controlNumber: this.generateControlNumber()
    };
    
    return { ...defaultConfig, ...overrides };
  }
  
  /**
   * Cria opções padrão de geração
   */
  createGenerationOptions(overrides: Partial<IGenerationOptions> = {}): IGenerationOptions {
    const defaultOptions: IGenerationOptions = {
      fileName: `extrato-${new Date().toISOString().split('T')[0]}.pdf`,
      includeRendaFixa: true,
      format: 'pdf',
      quality: 'high',
      theme: 'corporate',
      locale: 'pt-BR'
    };
    
    return { ...defaultOptions, ...overrides };
  }
  
  /**
   * Cria configuração de colunas da tabela financeira
   */
  createFinancialTableColumns(): ITableColumn[] {
    return [
      {
        key: 'dataAplicacao',
        label: 'Data aplic.',
        width: '80px',
        align: 'center'
      },
      {
        key: 'dataVencimento',
        label: 'Data vencto.',
        width: '80px',
        align: 'center'
      },
      {
        key: 'dataResgate',
        label: 'Resgate/Carência',
        width: '80px',
        align: 'center'
      },
      {
        key: 'taxa',
        label: 'Taxa (%)',
        width: '60px',
        align: 'center',
        formatter: (value: number) => value?.toFixed(2) || ''
      },
      {
        key: 'valorPrincipal',
        label: 'Valor princ. (BRL)',
        width: '100px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      },
      {
        key: 'valorBruto',
        label: 'Valor Bruto (BRL)',
        width: '100px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      },
      {
        key: 'rendaTotal',
        label: 'Renda total (BRL)',
        width: '100px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      },
      {
        key: 'iof',
        label: 'IOF (BRL)',
        width: '80px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      },
      {
        key: 'irrf',
        label: 'IRRF (BRL)',
        width: '80px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      },
      {
        key: 'valorLiquido',
        label: 'Valor Líquido (BRL)',
        width: '120px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      },
      {
        key: 'rendaBruta',
        label: 'Renda bruta per',
        width: '100px',
        align: 'right',
        formatter: (value: number) => this.formatCurrency(value)
      }
    ];
  }
  
  /**
   * Cria seções da tabela baseadas nos dados
   */
  createTableSections(rendaFixaData: any): ITableSection[] {
    const sections: ITableSection[] = [];
    
    if (rendaFixaData?.saldoAnterior) {
      sections.push({
        title: 'Saldo anterior',
        data: rendaFixaData.saldoAnterior,
        totals: rendaFixaData.saldoAteriorTotal,
        className: 'saldo-anterior-section'
      });
    }
    
    if (rendaFixaData?.aplicacao) {
      sections.push({
        title: 'Aplicações',
        data: rendaFixaData.aplicacao,
        totals: rendaFixaData.aplicacaoTotal,
        className: 'aplicacoes-section'
      });
    }
    
    if (rendaFixaData?.resgate) {
      sections.push({
        title: 'Resgates/Vencimentos',
        data: rendaFixaData.resgate,
        totals: rendaFixaData.resgateTotal,
        className: 'resgates-section'
      });
    }
    
    if (rendaFixaData?.saldoFinal) {
      sections.push({
        title: 'Saldo final',
        data: rendaFixaData.saldoFinal,
        totals: rendaFixaData.saldoFinalTotal,
        className: 'saldo-final-section'
      });
    }
    
    return sections;
  }
  
  
  /**
   * Cria configuração de tema
   */
  createThemeConfig(theme: string = 'corporate') {
    const themes = {
      corporate: {
        primaryColor: '#cc0000',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
      },
      minimal: {
        primaryColor: '#333333',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '11px'
      },
      default: {
        primaryColor: '#007bff',
        backgroundColor: '#ffffff',
        textColor: '#212529',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px'
      }
    };
    
    return themes[theme as keyof typeof themes] || themes.corporate;
  }
  
  /**
   * Gera número de controle único
   */
  private generateControlNumber(): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}${random}`;
  }
  
  /**
   * Formata valor monetário (método auxiliar)
   */
  private formatCurrency(value: number): string {
    return value?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0,00';
  }
}


/**
 * Factory especializada para dados financeiros
 */
@Injectable({
  providedIn: 'root'
})
export class FinancialDataFactoryService {
  
  /**
   * Cria item de extrato padronizado
   */
  createExtratoItem(data: Partial<any> = {}): any {
    return {
      dataAplicacao: data.dataAplicacao || '',
      dataVencimento: data.dataVencimento || '',
      dataResgate: data.dataResgate || '',
      taxa: data.taxa || 0,
      valorPrincipal: data.valorPrincipal || 0,
      valorBruto: data.valorBruto || 0,
      rendaTotal: data.rendaTotal || 0,
      iof: data.iof || 0,
      irrf: data.irrf || 0,
      valorLiquido: data.valorLiquido || 0,
      rendaBruta: data.rendaBruta || 0,
      ...data
    };
  }
  
  /**
   * Cria linha de total para seção
   */
  createTotalRow(items: any[]): any {
    return items.reduce((total, item) => ({
      valorPrincipal: (total.valorPrincipal || 0) + (item.valorPrincipal || 0),
      valorBruto: (total.valorBruto || 0) + (item.valorBruto || 0),
      rendaTotal: (total.rendaTotal || 0) + (item.rendaTotal || 0),
      iof: (total.iof || 0) + (item.iof || 0),
      irrf: (total.irrf || 0) + (item.irrf || 0),
      valorLiquido: (total.valorLiquido || 0) + (item.valorLiquido || 0),
      rendaBruta: (total.rendaBruta || 0) + (item.rendaBruta || 0)
    }), {});
  }
  
  /**
   * Valida item de extrato
   */
  validateExtratoItem(item: any): boolean {
    const requiredFields = ['dataAplicacao', 'valorPrincipal'];
    return requiredFields.every(field => item[field] !== undefined);
  }
  
  /**
   * Normaliza dados de entrada
   */
  normalizeFinancialData(data: any): any {
    if (!data) return {};
    
    return {
      ...data,
      valorPrincipal: Number(data.valorPrincipal) || 0,
      valorBruto: Number(data.valorBruto) || 0,
      rendaTotal: Number(data.rendaTotal) || 0,
      iof: Number(data.iof) || 0,
      irrf: Number(data.irrf) || 0,
      valorLiquido: Number(data.valorLiquido) || 0,
      rendaBruta: Number(data.rendaBruta) || 0,
      taxa: Number(data.taxa) || 0
    };
  }
}
