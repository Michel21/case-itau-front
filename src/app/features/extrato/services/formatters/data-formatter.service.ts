import { Injectable } from '@angular/core';
import { IDataFormatter } from '../interfaces/extrato-generator-clean.interfaces';

/**
 * Serviço responsável exclusivamente por formatação de dados
 * Segue o Single Responsibility Principle (SRP)
 */
@Injectable({
  providedIn: 'root'
})
export class DataFormatterService implements IDataFormatter {

  private readonly CURRENCY_CONFIG = {
    style: 'currency' as const,
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  private readonly DATE_CONFIG = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  } as const;

  private readonly DATETIME_CONFIG = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  } as const;

  /**
   * Formata valor numérico para moeda brasileira
   * @param value Valor a ser formatado
   * @returns String formatada em Real brasileiro
   */
  formatCurrency(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }

    try {
      return new Intl.NumberFormat('pt-BR', this.CURRENCY_CONFIG).format(value);
    } catch (error) {
      console.warn('Erro ao formatar moeda, usando fallback:', error);
      return this.formatCurrencyFallback(value);
    }
  }

  /**
   * Formata data para padrão brasileiro (DD/MM/YYYY)
   * @param date Data a ser formatada
   * @returns String formatada em padrão brasileiro
   */
  formatDate(date: Date | string): string {
    try {
      const dateObj = this.ensureDateObject(date);
      return new Intl.DateTimeFormat('pt-BR', this.DATE_CONFIG).format(dateObj);
    } catch (error) {
      console.warn('Erro ao formatar data, usando fallback:', error);
      return this.formatDateFallback(date);
    }
  }

  /**
   * Formata data e hora para padrão brasileiro (DD/MM/YYYY, HH:mm:ss)
   * @param date Data a ser formatada
   * @returns String formatada com data e hora
   */
  formatDateTime(date: Date): string {
    try {
      const dateTimeString = new Intl.DateTimeFormat('pt-BR', this.DATETIME_CONFIG).format(date);
      return dateTimeString.replace(/(\d{2}\/\d{2}\/\d{4}),?\s*(\d{2}:\d{2}:\d{2})/, '$1, $2');
    } catch (error) {
      console.warn('Erro ao formatar data/hora, usando fallback:', error);
      return this.formatDateTimeFallback(date);
    }
  }

  /**
   * Converte string de data brasileira (DD/MM/YYYY) para objeto Date
   * @param dateStr String no formato DD/MM/YYYY
   * @returns Objeto Date válido
   */
  convertBrazilianDate(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
      return new Date();
    }

    const cleanDateStr = dateStr.trim();
    const dateParts = cleanDateStr.split('/');

    if (dateParts.length !== 3) {
      console.warn(`Formato de data inválido: ${dateStr}. Esperado: DD/MM/YYYY`);
      return new Date();
    }

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JavaScript months são 0-indexed
    const year = parseInt(dateParts[2], 10);

    if (this.isValidDateParts(day, month + 1, year)) {
      return new Date(year, month, day);
    }

    console.warn(`Partes da data inválidas: dia=${day}, mês=${month + 1}, ano=${year}`);
    return new Date();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS (Clean Code: funções pequenas e focadas)
  // ============================================================================

  /**
   * Garante que o input seja um objeto Date válido
   */
  private ensureDateObject(date: Date | string): Date {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'string') {
      // Tenta converter string brasileira primeiro
      if (this.isBrazilianDateFormat(date)) {
        return this.convertBrazilianDate(date);
      }
      
      // Fallback para new Date()
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }

    return new Date();
  }

  /**
   * Verifica se a string está no formato brasileiro (DD/MM/YYYY)
   */
  private isBrazilianDateFormat(dateStr: string): boolean {
    const brazilianDatePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    return brazilianDatePattern.test(dateStr.trim());
  }

  /**
   * Valida se as partes da data são válidas
   */
  private isValidDateParts(day: number, month: number, year: number): boolean {
    return !isNaN(day) && !isNaN(month) && !isNaN(year) &&
           day >= 1 && day <= 31 &&
           month >= 1 && month <= 12 &&
           year >= 1900 && year <= 2100;
  }

  /**
   * Formatação de moeda como fallback em caso de erro
   */
  private formatCurrencyFallback(value: number): string {
    const fixed = Math.abs(value).toFixed(2);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sign = value < 0 ? '-' : '';
    return `${sign}R$ ${integerPart},${parts[1]}`;
  }

  /**
   * Formatação de data como fallback em caso de erro
   */
  private formatDateFallback(date: Date | string): string {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return new Date().toLocaleDateString('pt-BR');
      }
      
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return new Date().toLocaleDateString('pt-BR');
    }
  }

  /**
   * Formatação de data/hora como fallback em caso de erro
   */
  private formatDateTimeFallback(date: Date): string {
    try {
      const dateStr = this.formatDateFallback(date);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${dateStr}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return this.formatDateFallback(new Date());
    }
  }
}
