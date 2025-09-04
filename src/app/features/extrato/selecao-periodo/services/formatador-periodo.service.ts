import { Injectable } from '@angular/core';
import { IFormatadorPeriodo } from '../interfaces/formatador.interface';

/**
 * Serviço responsável apenas pela formatação de períodos (Single Responsibility Principle)
 */
@Injectable({
  providedIn: 'root'
})
export class FormatadorPeriodoService implements IFormatadorPeriodo {
  
  formatarPeriodo(mes: string, ano: string): string {
    if (!mes || !ano) return '';
    
    const nomeMes = this.obterNomeMes(mes);
    return `${nomeMes} de ${ano}`;
  }

  formatarIntervalo(dataInicio: Date, dataFim: Date): string {
    if (!dataInicio || !dataFim) return '';
    
    const formatoData = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    } as const;
    
    const inicioFormatada = dataInicio.toLocaleDateString('pt-BR', formatoData);
    const fimFormatada = dataFim.toLocaleDateString('pt-BR', formatoData);
    
    return `${inicioFormatada} a ${fimFormatada}`;
  }

  obterNomeMes(numeroMes: string): string {
    const mes = parseInt(numeroMes);
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return nomesMeses[mes - 1] || '';
  }
}
