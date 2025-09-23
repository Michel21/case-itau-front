import { Injectable } from '@angular/core';
import { IFormatter } from '../interfaces/extrato-generator.interfaces';

/**
 * Serviço de formatação reutilizável para documentos
 * Centraliza todas as operações de formatação em um local
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentFormatterService implements IFormatter {
  
  private formatCache = new Map<string, string>();
  private readonly CACHE_LIMIT = 200;
  
  /**
   * Formata valores monetários com cache inteligente
   */
  formatCurrency(value: number, locale: string = 'pt-BR'): string {
    const cacheKey = `currency_${value}_${locale}`;
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey)!;
    }
    
    const formatted = value.toLocaleString(locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    
    this.setCacheValue(cacheKey, formatted);
    return formatted;
  }
  
  /**
   * Formata datas com opções flexíveis
   */
  formatDate(date: Date, locale: string = 'pt-BR', options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    const cacheKey = `date_${date.getTime()}_${locale}_${JSON.stringify(finalOptions)}`;
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey)!;
    }
    
    const formatted = date.toLocaleDateString(locale, finalOptions);
    this.setCacheValue(cacheKey, formatted);
    return formatted;
  }
  
  /**
   * Formata data e hora completas
   */
  formatDateTime(date: Date, locale: string = 'pt-BR'): string {
    const cacheKey = `datetime_${date.getTime()}_${locale}`;
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey)!;
    }
    
    const formatted = date.toLocaleString(locale);
    this.setCacheValue(cacheKey, formatted);
    return formatted;
  }
  
  /**
   * Formata percentuais
   */
  formatPercentage(value: number, decimals: number = 2, locale: string = 'pt-BR'): string {
    const cacheKey = `percentage_${value}_${decimals}_${locale}`;
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey)!;
    }
    
    const formatted = value.toLocaleString(locale, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }) + '%';
    
    this.setCacheValue(cacheKey, formatted);
    return formatted;
  }
  
  /**
   * Formata apenas horas
   */
  formatTime(date: Date, locale: string = 'pt-BR'): string {
    const cacheKey = `time_${date.getTime()}_${locale}`;
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey)!;
    }
    
    const formatted = date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    this.setCacheValue(cacheKey, formatted);
    return formatted;
  }
  
  /**
   * Formata números genéricos
   */
  formatNumber(value: number, options: Intl.NumberFormatOptions = {}, locale: string = 'pt-BR'): string {
    const cacheKey = `number_${value}_${JSON.stringify(options)}_${locale}`;
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey)!;
    }
    
    const formatted = value.toLocaleString(locale, options);
    this.setCacheValue(cacheKey, formatted);
    return formatted;
  }
  
  /**
   * Formata strings com template
   */
  formatTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }
  
  /**
   * Capitaliza primeira letra
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  
  /**
   * Formata texto para título
   */
  toTitleCase(text: string): string {
    return text.split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }
  
  /**
   * Limpa cache de formatação
   */
  clearCache(): void {
    this.formatCache.clear();
  }
  
  /**
   * Define valor no cache com limite de tamanho
   */
  private setCacheValue(key: string, value: string): void {
    if (this.formatCache.size >= this.CACHE_LIMIT) {
      // Remove o primeiro item (FIFO)
      const firstKey = this.formatCache.keys().next().value;
      if (firstKey !== undefined) {
        this.formatCache.delete(firstKey);
      }
    }
    
    this.formatCache.set(key, value);
  }
}
