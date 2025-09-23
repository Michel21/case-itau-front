import { Injectable } from '@angular/core';
import { ITemplateEngine, IDocumentTemplate } from '../interfaces/extrato-generator.interfaces';

/**
 * Motor de templates reutilizável para geração de documentos
 * Permite criação e reutilização de templates estruturados
 */
@Injectable({
  providedIn: 'root'
})
export class TemplateEngineService implements ITemplateEngine {
  
  private templates = new Map<string, IDocumentTemplate>();
  private compiledTemplates = new Map<string, Function>();
  
  constructor() {
    this.initializeDefaultTemplates();
  }
  
  /**
   * Registra um novo template
   */
  registerTemplate(name: string, template: string | IDocumentTemplate): void {
    if (typeof template === 'string') {
      const documentTemplate: IDocumentTemplate = {
        name,
        cssTemplate: '',
        htmlStructure: template,
        sections: [],
        metadata: {
          version: '1.0.0',
          author: 'system',
          description: `Template ${name}`
        }
      };
      this.templates.set(name, documentTemplate);
    } else {
      this.templates.set(name, template);
    }
    
    // Limpar template compilado para forçar recompilação
    this.compiledTemplates.delete(name);
  }
  
  /**
   * Renderiza um template com dados
   */
  render(templateName: string, data: any): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' não encontrado`);
    }
    
    // Usar template compilado se disponível
    let compiledTemplate = this.compiledTemplates.get(templateName);
    if (!compiledTemplate) {
      compiledTemplate = this.compileTemplate(template.htmlStructure);
      this.compiledTemplates.set(templateName, compiledTemplate);
    }
    
    return compiledTemplate(data);
  }
  
  /**
   * Verifica se template existe
   */
  hasTemplate(name: string): boolean {
    return this.templates.has(name);
  }
  
  /**
   * Lista todos os templates disponíveis
   */
  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
  
  /**
   * Obtém metadados de um template
   */
  getTemplateMetadata(name: string): IDocumentTemplate['metadata'] | null {
    const template = this.templates.get(name);
    return template ? template.metadata : null;
  }
  
  /**
   * Limpa todos os templates
   */
  clearTemplates(): void {
    this.templates.clear();
    this.compiledTemplates.clear();
  }
  
  /**
   * Compila template para função reutilizável
   */
  private compileTemplate(templateString: string): Function {
    // Template simples com interpolação {{ variavel }}
    return (data: any) => {
      return templateString.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const keys = key.trim().split('.');
        let value = data;
        
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) break;
        }
        
        // Permitir funções helper
        if (typeof value === 'function') {
          return value(data);
        }
        
        return value !== undefined ? String(value) : '';
      });
    };
  }
  
  /**
   * Inicializa templates padrão do sistema
   */
  private initializeDefaultTemplates(): void {
    // Template para cabeçalho de extrato
    this.registerTemplate('extrato-header', {
      name: 'extrato-header',
      cssTemplate: `
        .extrato-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          padding-bottom: 15px;
        }
      `,
      htmlStructure: `
        <header class="extrato-header">
          <div class="header-left">
            <div class="logo">{{empresa.nome}}</div>
            <div class="subtitle">{{empresa.subtitulo}}</div>
            <div class="global-solutions">{{empresa.divisao}}</div>
          </div>
          <div class="header-right">
            <div class="report-title">{{documento.titulo}}</div>
            <div class="transaction-date">Movimento do dia: {{documento.dataMovimento}}</div>
            <div class="control-number">Controle: {{documento.numeroControle}}</div>
          </div>
        </header>
      `,
      sections: ['header-left', 'header-right'],
      metadata: {
        version: '1.0.0',
        author: 'ExtratoGenerator',
        description: 'Template padrão para cabeçalho de extratos'
      }
    });
    
    // Template para seção de detalhes da pesquisa
    this.registerTemplate('pesquisa-detalhes', {
      name: 'pesquisa-detalhes',
      cssTemplate: `
        .search-details {
          background-color: #fff;
          padding: 8px 0;
          border: none;
          margin-bottom: 12px;
        }
      `,
      htmlStructure: `
        <section class="search-details">
          <div class="search-info">
            <span class="search-label">Agência:</span>
            <span class="search-value">{{agencia}}</span>
            <span class="search-label">Conta:</span>
            <span class="search-value">{{conta}}</span>
            <span class="search-label">Período:</span>
            <span class="search-value">{{periodo}}</span>
          </div>
        </section>
      `,
      sections: ['search-info'],
      metadata: {
        version: '1.0.0',
        author: 'ExtratoGenerator',
        description: 'Template para seção de detalhes da pesquisa'
      }
    });
    
    // Template para linha de dados da tabela
    this.registerTemplate('tabela-linha-dados', {
      name: 'tabela-linha-dados',
      cssTemplate: '',
      htmlStructure: `
        <tr class="data-row">
          <td>{{dataAplicacao}}</td>
          <td>{{dataVencimento}}</td>
          <td>{{dataResgate}}</td>
          <td>{{taxa}}</td>
          <td>{{valorPrincipal}}</td>
          <td>{{valorBruto}}</td>
          <td>{{rendaTotal}}</td>
          <td>{{iof}}</td>
          <td>{{irrf}}</td>
          <td>{{valorLiquido}}</td>
          <td>{{rendaBruta}}</td>
        </tr>
      `,
      sections: ['data-row'],
      metadata: {
        version: '1.0.0',
        author: 'ExtratoGenerator',
        description: 'Template para linha de dados da tabela financeira'
      }
    });
    
    // Template para linha de total
    this.registerTemplate('tabela-linha-total', {
      name: 'tabela-linha-total',
      cssTemplate: `
        .total-row {
          background-color: transparent !important;
          color: #000 !important;
          font-weight: bold;
          padding: 8px 0 !important;
          margin-bottom: 10px;
        }
      `,
      htmlStructure: `
        <tr class="total-row">
          <td><strong>{{labelTotal}}</strong></td>
          <td></td>
          <td></td>
          <td></td>
          <td><strong>{{totalPrincipal}}</strong></td>
          <td><strong>{{totalBruto}}</strong></td>
          <td><strong>{{totalRenda}}</strong></td>
          <td><strong>{{totalIof}}</strong></td>
          <td><strong>{{totalIrrf}}</strong></td>
          <td><strong>{{totalLiquido}}</strong></td>
          <td><strong>{{totalRendaBruta}}</strong></td>
        </tr>
      `,
      sections: ['total-row'],
      metadata: {
        version: '1.0.0',
        author: 'ExtratoGenerator',
        description: 'Template para linha de totais da tabela'
      }
    });
    
    // Template completo de documento
    this.registerTemplate('extrato-completo', {
      name: 'extrato-completo',
      cssTemplate: `
        .extrato-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 25px;
          background: #fff;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          line-height: 1.3;
          color: #000;
        }
      `,
      htmlStructure: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{documento.titulo}}</title>
          <style>{{estilos}}</style>
        </head>
        <body>
          <div class="extrato-container">
            {{cabecalho}}
            {{detalhes}}
            {{conteudo}}
            {{rodape}}
          </div>
        </body>
        </html>
      `,
      sections: ['cabecalho', 'detalhes', 'conteudo', 'rodape'],
      metadata: {
        version: '1.0.0',
        author: 'ExtratoGenerator',
        description: 'Template completo para documento de extrato'
      }
    });
  }
}
