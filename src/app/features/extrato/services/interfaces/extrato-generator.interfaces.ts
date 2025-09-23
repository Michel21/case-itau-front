/**
 * Interfaces para o sistema de geração de extratos
 * Promove reutilização e facilita manutenção
 */

export interface ICacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  clear(): void;
}

export interface IFormatter {
  formatCurrency(value: number): string;
  formatDate(date: Date): string;
  formatDateTime(date: Date): string;
  formatPercentage(value: number): string;
  formatTime(date: Date): string;
}

export interface IHtmlBuilder {
  addElement(tag: string, content?: string, attributes?: Record<string, string>): IHtmlBuilder;
  addText(text: string): IHtmlBuilder;
  openTag(tag: string, attributes?: Record<string, string>): IHtmlBuilder;
  closeTag(tag: string): IHtmlBuilder;
  build(): string;
  reset(): IHtmlBuilder;
}

export interface ITableBuilder {
  addHeader(columns: string[]): ITableBuilder;
  addRow(cells: string[]): ITableBuilder;
  addSection(title: string): ITableBuilder;
  addTotalRow(cells: string[]): ITableBuilder;
  setTableClass(className: string): ITableBuilder;
  build(): string;
  reset(): ITableBuilder;
}

export interface ICssBuilder {
  addRule(selector: string, properties: Record<string, string>): ICssBuilder;
  addMediaQuery(query: string, rules: string): ICssBuilder;
  build(): string;
  reset(): ICssBuilder;
}

export interface ITemplateEngine {
  registerTemplate(name: string, template: string): void;
  render(templateName: string, data: any): string;
  hasTemplate(name: string): boolean;
  clearTemplates(): void;
}

export interface IExtratoGenerator {
  generatePDF(data: any, config: any, options?: any): Promise<boolean>;
  generateCSV(data: any, config: any, options?: any): Promise<boolean>;
  generateHTML(data: any, config: any, options?: any): string;
  clearCache(): void;
}

export interface IDocumentConfig {
  title: string;
  company: string;
  agency: string;
  account: string;
  period: string;
  generationDate: Date;
  controlNumber: string;
}

export interface IGenerationOptions {
  fileName?: string;
  includeRendaFixa?: boolean;
  format?: 'pdf' | 'csv' | 'html';
  quality?: 'low' | 'medium' | 'high';
  theme?: 'default' | 'corporate' | 'minimal';
  locale?: string;
}

export interface ITableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
}

export interface ITableSection {
  title: string;
  data: any[];
  totals?: any;
  className?: string;
}

export interface IDocumentTemplate {
  name: string;
  cssTemplate: string;
  htmlStructure: string;
  sections: string[];
  metadata: {
    version: string;
    author: string;
    description: string;
  };
}
