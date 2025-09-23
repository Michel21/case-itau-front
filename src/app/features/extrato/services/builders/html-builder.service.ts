import { Injectable } from '@angular/core';
import { IHtmlBuilder, ITableBuilder, ICssBuilder } from '../interfaces/extrato-generator.interfaces';

/**
 * Builder fluente para construção de HTML
 * Facilita criação e manutenção de estruturas HTML complexas
 */
@Injectable({
  providedIn: 'root'
})
export class HtmlBuilderService implements IHtmlBuilder {
  
  private elements: string[] = [];
  
  /**
   * Adiciona um elemento HTML completo
   */
  addElement(tag: string, content: string = '', attributes: Record<string, string> = {}): IHtmlBuilder {
    const attrs = this.buildAttributes(attributes);
    this.elements.push(`<${tag}${attrs}>${content}</${tag}>`);
    return this;
  }
  
  /**
   * Adiciona texto simples (escapado)
   */
  addText(text: string): IHtmlBuilder {
    this.elements.push(this.escapeHtml(text));
    return this;
  }
  
  /**
   * Adiciona HTML sem escapar (use com cuidado)
   */
  addRawHtml(html: string): IHtmlBuilder {
    this.elements.push(html);
    return this;
  }
  
  /**
   * Abre uma tag HTML
   */
  openTag(tag: string, attributes: Record<string, string> = {}): IHtmlBuilder {
    const attrs = this.buildAttributes(attributes);
    this.elements.push(`<${tag}${attrs}>`);
    return this;
  }
  
  /**
   * Fecha uma tag HTML
   */
  closeTag(tag: string): IHtmlBuilder {
    this.elements.push(`</${tag}>`);
    return this;
  }
  
  /**
   * Adiciona quebra de linha
   */
  addLineBreak(): IHtmlBuilder {
    this.elements.push('<br>');
    return this;
  }
  
  /**
   * Adiciona div com classe
   */
  addDiv(content: string = '', className?: string): IHtmlBuilder {
    const attrs: Record<string, string> = className ? { class: className } : {};
    return this.addElement('div', content, attrs);
  }
  
  /**
   * Adiciona span com classe
   */
  addSpan(content: string = '', className?: string): IHtmlBuilder {
    const attrs: Record<string, string> = className ? { class: className } : {};
    return this.addElement('span', content, attrs);
  }
  
  /**
   * Adiciona parágrafo
   */
  addParagraph(content: string, className?: string): IHtmlBuilder {
    const attrs: Record<string, string> = className ? { class: className } : {};
    return this.addElement('p', content, attrs);
  }
  
  /**
   * Adiciona cabeçalho (h1-h6)
   */
  addHeading(level: 1 | 2 | 3 | 4 | 5 | 6, content: string, className?: string): IHtmlBuilder {
    const attrs: Record<string, string> = className ? { class: className } : {};
    return this.addElement(`h${level}`, content, attrs);
  }
  
  /**
   * Adiciona lista não ordenada
   */
  addUnorderedList(items: string[], className?: string): IHtmlBuilder {
    const attrs: Record<string, string> = className ? { class: className } : {};
    this.openTag('ul', attrs);
    items.forEach(item => this.addElement('li', item));
    this.closeTag('ul');
    return this;
  }
  
  /**
   * Adiciona lista ordenada
   */
  addOrderedList(items: string[], className?: string): IHtmlBuilder {
    const attrs: Record<string, string> = className ? { class: className } : {};
    this.openTag('ol', attrs);
    items.forEach(item => this.addElement('li', item));
    this.closeTag('ol');
    return this;
  }
  
  /**
   * Constrói e retorna o HTML final
   */
  build(): string {
    return this.elements.join('');
  }
  
  /**
   * Limpa o builder para reutilização
   */
  reset(): IHtmlBuilder {
    this.elements = [];
    return this;
  }
  
  /**
   * Constrói atributos HTML
   */
  private buildAttributes(attributes: Record<string, string>): string {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeAttribute(value)}"`)
      .join(' ');
    return attrs ? ` ${attrs}` : '';
  }
  
  /**
   * Escapa HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Escapa atributos HTML
   */
  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/**
 * Builder especializado para tabelas HTML
 */
@Injectable({
  providedIn: 'root'
})
export class TableBuilderService implements ITableBuilder {
  
  private htmlBuilder = new HtmlBuilderService();
  private tableClass = '';
  
  /**
   * Define classe CSS da tabela
   */
  setTableClass(className: string): ITableBuilder {
    this.tableClass = className;
    return this;
  }
  
  /**
   * Adiciona cabeçalho da tabela
   */
  addHeader(columns: string[]): ITableBuilder {
    this.htmlBuilder.openTag('thead');
    this.htmlBuilder.openTag('tr', { class: 'table-header' });
    
    columns.forEach(column => {
      this.htmlBuilder.addElement('th', column);
    });
    
    this.htmlBuilder.closeTag('tr');
    this.htmlBuilder.closeTag('thead');
    return this;
  }
  
  /**
   * Adiciona linha de dados
   */
  addRow(cells: string[], className: string = 'data-row'): ITableBuilder {
    this.htmlBuilder.openTag('tr', { class: className });
    
    cells.forEach(cell => {
      this.htmlBuilder.addElement('td', cell);
    });
    
    this.htmlBuilder.closeTag('tr');
    return this;
  }
  
  /**
   * Adiciona seção com título
   */
  addSection(title: string): ITableBuilder {
    this.htmlBuilder.openTag('tr', { class: 'section-title' });
    this.htmlBuilder.addElement('th', title, { 
      colspan: '11', 
      style: 'padding-left: 35px !important;' 
    });
    this.htmlBuilder.closeTag('tr');
    return this;
  }
  
  /**
   * Adiciona linha de total
   */
  addTotalRow(cells: string[]): ITableBuilder {
    this.htmlBuilder.openTag('tr', { class: 'total-row' });
    
    cells.forEach((cell, index) => {
      const isFirst = index === 0;
      const style = isFirst ? 'text-align: left !important; padding-left: 0px !important;' : '';
      const content = isFirst ? `<strong>${cell}</strong>` : `<strong>${cell}</strong>`;
      
      this.htmlBuilder.addElement('td', content, style ? { style } : {});
    });
    
    this.htmlBuilder.closeTag('tr');
    return this;
  }
  
  /**
   * Inicia construção da tabela
   */
  private startTable(): void {
    const attrs: Record<string, string> = this.tableClass ? { class: this.tableClass } : {};
    this.htmlBuilder.openTag('table', attrs);
  }
  
  /**
   * Finaliza construção da tabela
   */
  private endTable(): void {
    this.htmlBuilder.closeTag('table');
  }
  
  /**
   * Constrói a tabela completa
   */
  build(): string {
    const tableContent = this.htmlBuilder.build();
    this.htmlBuilder.reset();
    
    this.startTable();
    this.htmlBuilder.addRawHtml(tableContent);
    this.endTable();
    
    return this.htmlBuilder.build();
  }
  
  /**
   * Limpa o builder para reutilização
   */
  reset(): ITableBuilder {
    this.htmlBuilder.reset();
    this.tableClass = '';
    return this;
  }
}

/**
 * Builder para CSS reutilizável
 */
@Injectable({
  providedIn: 'root'
})
export class CssBuilderService implements ICssBuilder {
  
  private rules: string[] = [];
  
  /**
   * Adiciona regra CSS
   */
  addRule(selector: string, properties: Record<string, string>): ICssBuilder {
    const props = Object.entries(properties)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    this.rules.push(`${selector} {\n${props}\n}`);
    return this;
  }
  
  /**
   * Adiciona media query
   */
  addMediaQuery(query: string, rules: string): ICssBuilder {
    this.rules.push(`@media ${query} {\n${rules}\n}`);
    return this;
  }
  
  /**
   * Adiciona comentário CSS
   */
  addComment(comment: string): ICssBuilder {
    this.rules.push(`/* ${comment} */`);
    return this;
  }
  
  /**
   * Adiciona import CSS
   */
  addImport(url: string): ICssBuilder {
    this.rules.unshift(`@import url('${url}');`);
    return this;
  }
  
  /**
   * Constrói o CSS final
   */
  build(): string {
    return this.rules.join('\n\n');
  }
  
  /**
   * Limpa o builder para reutilização
   */
  reset(): ICssBuilder {
    this.rules = [];
    return this;
  }
}
