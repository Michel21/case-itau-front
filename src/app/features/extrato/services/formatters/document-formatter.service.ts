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
  
  /**
   * Formata valores monetários
   */
  formatCurrency(value: number, locale: string = 'pt-BR'): string {
    return value.toLocaleString(locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  
  /**
   * Formata datas
   */
  formatDate(date: Date, locale: string = 'pt-BR', options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    return date.toLocaleDateString(locale, finalOptions);
  }
  
  /**
   * Formata data e hora completas
   */
  formatDateTime(date: Date, locale: string = 'pt-BR'): string {
    return date.toLocaleString(locale);
  }
  
  /**
   * Formata percentuais
   */
  formatPercentage(value: number, decimals: number = 2, locale: string = 'pt-BR'): string {
    return value.toLocaleString(locale, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }) + '%';
  }
  
  /**
   * Formata apenas horas
   */
  formatTime(date: Date, locale: string = 'pt-BR'): string {
    return date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  /**
   * Formata números genéricos
   */
  formatNumber(value: number, options: Intl.NumberFormatOptions = {}, locale: string = 'pt-BR'): string {
    return value.toLocaleString(locale, options);
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
  
}
