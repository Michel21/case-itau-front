import { Injectable } from '@angular/core';
import { IFormatadorPeriodo } from '../interfaces/formatador.interface';
import { PeriodoMesAno, PeriodoIntervalo } from '../interfaces/periodo.interface';

/**
 * Serviço responsável apenas pela formatação de períodos (Single Responsibility Principle)
 * - SRP: Responsável exclusivamente por formatação de dados
 * - Open/Closed: Aberto para extensão, fechado para modificação
 * - Liskov Substitution: Pode ser substituído por outras implementações de IFormatadorPeriodo
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

  formatarData(data: Date, formato?: string): string {
    if (!data) return '';
    
    const formatoPadrao = formato || 'dd/MM/yyyy';
    const opcoes: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    return data.toLocaleDateString('pt-BR', opcoes);
  }

  formatarPeriodoCompleto(periodo: PeriodoMesAno): string {
    if (!periodo) return '';
    
    if (periodo.tipo === 'mes' && periodo.mes && periodo.ano) {
      return this.formatarPeriodo(periodo.mes, periodo.ano);
    }
    
    if (periodo.tipo === 'intervalo' && periodo.dataInicio && periodo.dataFim) {
      const dataInicio = new Date(periodo.dataInicio);
      const dataFim = new Date(periodo.dataFim);
      return this.formatarIntervalo(dataInicio, dataFim);
    }
    
    return periodo.valor || '';
  }

  formatarIntervaloCompleto(intervalo: PeriodoIntervalo): string {
    if (!intervalo) return '';
    
    return this.formatarIntervalo(intervalo.dataInicio, intervalo.dataFim);
  }
}
