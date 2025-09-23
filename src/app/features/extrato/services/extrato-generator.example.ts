import { Injectable } from '@angular/core';
import { ExtratoGeneratorService, ExtratoConfig, GeracaoOptions } from './extrato-generator.service';
import { ExtratoDados } from '../../../../../types/extrato.types';

/**
 * Exemplo de uso do ExtratoGeneratorService
 * Demonstra como usar o serviço independentemente do template HTML
 */
@Injectable({
  providedIn: 'root'
})
export class ExtratoGeneratorExample {
  constructor(private extratoGenerator: ExtratoGeneratorService) {}

  /**
   * Exemplo de geração de PDF
   */
  async exemploGerarPDF(): Promise<void> {
    const extratoData: ExtratoDados = {
      itens: [
        { data: '2024-09-01', descricao: 'Depósito Inicial', valor: 1000, saldo: 1000 },
        { data: '2024-09-02', descricao: 'Saque', valor: -100, saldo: 900 },
        { data: '2024-09-03', descricao: 'Depósito', valor: 500, saldo: 1400 }
      ]
    };

    const config: ExtratoConfig = {
      titulo: 'Extrato Bancário',
      empresa: 'Banco Exemplo',
      agencia: '0001',
      conta: '12345-6',
      periodo: '01/09/2024 - 30/09/2024',
      dataGeracao: new Date(),
      numeroControle: this.gerarNumeroControle(),
      itens: extratoData.itens
    };

    const options: GeracaoOptions = {
      fileName: 'extrato-exemplo.pdf',
      quality: 'high'
    };

    try {
      const sucesso = await this.extratoGenerator.gerarPDF(extratoData, config, options);
      
      if (sucesso) {
        console.log('PDF gerado com sucesso!');
      } else {
        console.log('Erro ao gerar PDF');
      }
    } catch (error) {
      console.log('Erro inesperado:', error);
    }
  }

  /**
   * Exemplo de geração de CSV
   */
  async exemploGerarCSV(): Promise<void> {
    const extratoData: ExtratoDados = {
      itens: [
        { data: '2024-09-01', descricao: 'Depósito Inicial', valor: 1000, saldo: 1000 },
        { data: '2024-09-02', descricao: 'Saque', valor: -100, saldo: 900 }
      ]
    };

    const config: ExtratoConfig = {
      titulo: 'Extrato Bancário',
      empresa: 'Banco Exemplo',
      agencia: '0001',
      conta: '12345-6',
      periodo: '01/09/2024 - 30/09/2024',
      dataGeracao: new Date(),
      numeroControle: this.gerarNumeroControle(),
      itens: extratoData.itens
    };

    const options: GeracaoOptions = {
      fileName: 'extrato-exemplo.csv'
    };

    try {
      const sucesso = await this.extratoGenerator.gerarCSV(extratoData, config, options);
      
      if (sucesso) {
        console.log('CSV gerado com sucesso!');
      } else {
        console.log('Erro ao gerar CSV');
      }
    } catch (error) {
      console.log('Erro inesperado:', error);
    }
  }

  /**
   * Exemplo de geração de HTML
   */
  async exemploGerarHTML(): Promise<void> {
    const extratoData: ExtratoDados = {
      itens: [
        { data: '2024-09-01', descricao: 'Depósito Inicial', valor: 1000, saldo: 1000 },
        { data: '2024-09-02', descricao: 'Saque', valor: -100, saldo: 900 }
      ]
    };

    const config: ExtratoConfig = {
      titulo: 'Extrato Bancário',
      empresa: 'Banco Exemplo',
      agencia: '0001',
      conta: '12345-6',
      periodo: '01/09/2024 - 30/09/2024',
      dataGeracao: new Date(),
      numeroControle: this.gerarNumeroControle(),
      itens: extratoData.itens
    };

    const options: GeracaoOptions = {
      fileName: 'extrato-exemplo.html'
    };

    try {
      const sucesso = await this.extratoGenerator.gerarHTML(extratoData, config, options);
      
      if (sucesso) {
        console.log('HTML gerado com sucesso!');
      } else {
        console.log('Erro ao gerar HTML');
      }
    } catch (error) {
      console.log('Erro inesperado:', error);
    }
  }

  /**
   * Exemplo de geração em lote
   */
  async exemploGerarEmLote(): Promise<void> {
    const extratos = [
      { data: '2024-09-01', descricao: 'Depósito', valor: 1000, saldo: 1000 },
      { data: '2024-09-02', descricao: 'Saque', valor: -100, saldo: 900 }
    ];

    const config: ExtratoConfig = {
      titulo: 'Extrato Bancário',
      empresa: 'Banco Exemplo',
      agencia: '0001',
      conta: '12345-6',
      periodo: '01/09/2024 - 30/09/2024',
      dataGeracao: new Date(),
      numeroControle: this.gerarNumeroControle(),
      itens: extratos
    };

    // Gerar PDF
    const pdfSucesso = await this.extratoGenerator.gerarPDF(
      { itens: extratos }, 
      config, 
      { fileName: 'extrato.pdf', quality: 'high' }
    );

    // Gerar CSV
    const csvSucesso = await this.extratoGenerator.gerarCSV(
      { itens: extratos }, 
      config, 
      { fileName: 'extrato.csv' }
    );

    // Gerar HTML
    const htmlSucesso = await this.extratoGenerator.gerarHTML(
      { itens: extratos }, 
      config, 
      { fileName: 'extrato.html' }
    );

    console.log('Resultados:', { pdfSucesso, csvSucesso, htmlSucesso });
  }

  /**
   * Gera número de controle
   */
  private gerarNumeroControle(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
