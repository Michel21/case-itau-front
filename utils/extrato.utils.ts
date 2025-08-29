import { ExtratoSecao, ExtratoItem } from '../types/extrato.types';

/**
 * Utilitários para formatação e validação de extratos
 */
export class ExtratoUtils {
  
  /**
   * Verifica se uma seção tem itens
   */
  static temItens(secao: ExtratoSecao | null | undefined): boolean {
    return !!(secao?.itens && secao.itens.length > 0);
  }

  /**
   * Formata valor monetário para exibição brasileira
   */
  static formatarMoeda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  /**
   * Formata data para exibição brasileira
   */
  static formatarData(data: string | null | undefined): string {
    if (!data) return '';
    
    try {
      const [dia, mes, ano] = data.split('/');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return data;
    }
  }

  /**
   * Formata percentual
   */
  static formatarPercentual(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '';
    
    return `${valor.toFixed(2)}%`;
  }

  /**
   * Gera número de controle único
   */
  static gerarNumeroControle(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  /**
   * Obtém data atual formatada
   */
  static getDataAtual(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  /**
   * Obtém hora atual formatada
   */
  static getHoraAtual(): string {
    return new Date().toLocaleTimeString('pt-BR');
  }

  /**
   * Valida se um item de extrato é válido
   */
  static validarItem(item: ExtratoItem): boolean {
    return !!(
      item.dataAplicacao &&
      item.dataVencimento &&
      (item.valorPrincipal !== null && item.valorPrincipal !== undefined)
    );
  }

  /**
   * Calcula totais de uma seção
   */
  static calcularTotais(secao: ExtratoSecao): ExtratoSecao {
    const totais = {
      totalValorPrincipal: 0,
      totalValorBruto: 0,
      totalRendaTotal: 0,
      totalIof: 0,
      totalIrrf: 0,
      totalValorLiquido: 0,
      totalRendaBrutaPer: 0
    };

    secao.itens.forEach(item => {
      totais.totalValorPrincipal += item.valorPrincipal || 0;
      totais.totalValorBruto += item.valorBruto || 0;
      totais.totalRendaTotal += item.rendaTotal || 0;
      totais.totalIof += item.iof || 0;
      totais.totalIrrf += item.irrf || 0;
      totais.totalValorLiquido += item.valorLiquido || 0;
      totais.totalRendaBrutaPer += item.rendaBrutaPer || 0;
    });

    return {
      ...secao,
      ...totais
    };
  }

  /**
   * Converte item para linha CSV
   */
  static itemParaCSV(item: ExtratoItem, secao: string): string {
    const campos = [
      `"${secao}"`,
      `"${this.formatarData(item.dataAplicacao)}"`,
      `"${this.formatarData(item.dataVencimento)}"`,
      `"${this.formatarData(item.dataResgate)}"`,
      `"${item.taxa || ''}"`,
      `"${this.formatarMoeda(item.valorPrincipal)}"`,
      `"${this.formatarMoeda(item.valorBruto)}"`,
      `"${this.formatarMoeda(item.rendaTotal)}"`,
      `"${this.formatarMoeda(item.iof)}"`,
      `"${this.formatarMoeda(item.irrf)}"`,
      `"${this.formatarMoeda(item.valorLiquido)}"`,
      `"${this.formatarMoeda(item.rendaBrutaPer)}"`
    ];
    
    return campos.join(';');
  }

  /**
   * Converte totais para linha CSV
   */
  static totaisParaCSV(secao: ExtratoSecao, nomeSecao: string): string {
    const campos = [
      `"Total ${nomeSecao}"`,
      '',
      '',
      '',
      '',
      `"${this.formatarMoeda(secao.totalValorPrincipal)}"`,
      `"${this.formatarMoeda(secao.totalValorBruto)}"`,
      `"${this.formatarMoeda(secao.totalRendaTotal)}"`,
      `"${this.formatarMoeda(secao.totalIof)}"`,
      `"${this.formatarMoeda(secao.totalIrrf)}"`,
      `"${this.formatarMoeda(secao.totalValorLiquido)}"`,
      `"${this.formatarMoeda(secao.totalRendaBrutaPer)}"`
    ];
    
    return campos.join(';');
  }

  /**
   * Gera nome de arquivo com timestamp
   */
  static gerarNomeArquivo(prefixo: string, extensao: string): string {
    const data = new Date().toISOString().split('T')[0];
    return `${prefixo}-${data}.${extensao}`;
  }

  /**
   * Escapa caracteres especiais para CSV
   */
  static escaparCSV(valor: string): string {
    if (typeof valor !== 'string') return valor;
    
    // Se contém aspas, vírgula ou quebra de linha, escapa
    if (valor.includes('"') || valor.includes(',') || valor.includes('\n')) {
      return `"${valor.replace(/"/g, '""')}"`;
    }
    
    return valor;
  }
}
