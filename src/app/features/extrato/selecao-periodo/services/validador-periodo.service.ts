import { Injectable } from '@angular/core';
import { IValidadorPeriodo } from '../interfaces/validacao.interface';
import { ConfiguracaoPeriodo } from '../interfaces/periodo.interface';

/**
 * Serviço responsável apenas pela validação de períodos (Single Responsibility Principle)
 */
@Injectable({
  providedIn: 'root'
})
export class ValidadorPeriodoService implements IValidadorPeriodo {
  private readonly configuracao: ConfiguracaoPeriodo;

  constructor() {
    this.configuracao = {
      limiteDiasIntervalo: 90,
      limiteMesesHistorico: 12
    };
  }

  validarIntervaloDatas(dataInicio: Date, dataFim: Date): boolean {
    if (!dataInicio || !dataFim) return false;
    if (dataInicio > dataFim) return false;
    
    const diferencaDias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    return diferencaDias <= this.configuracao.limiteDiasIntervalo;
  }

  validarLimiteHistorico(data: Date): boolean {
    if (!data) return false;
    
    const dataAtual = new Date();
    const limiteHistorico = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() - this.configuracao.limiteMesesHistorico,
      dataAtual.getDate()
    );
    
    return data >= limiteHistorico && data <= dataAtual;
  }

  validarPeriodoCompleto(
    tipo: 'mes' | 'intervalo',
    mes?: string,
    ano?: string,
    dataInicio?: Date,
    dataFim?: Date
  ): { valido: boolean; mensagem: string } {
    if (tipo === 'mes') {
      return this.validarPeriodoMesAno(mes, ano);
    }
    
    if (tipo === 'intervalo') {
      return this.validarPeriodoIntervalo(dataInicio, dataFim);
    }
    
    return { valido: false, mensagem: 'Tipo de período inválido' };
  }

  private validarPeriodoMesAno(mes?: string, ano?: string): { valido: boolean; mensagem: string } {
    if (!mes || !ano) {
      return { valido: false, mensagem: 'Mês e ano são obrigatórios' };
    }

    const dataPeriodo = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    
    if (!this.validarLimiteHistorico(dataPeriodo)) {
      return { 
        valido: false, 
        mensagem: `Período deve estar dentro dos últimos ${this.configuracao.limiteMesesHistorico} meses` 
      };
    }

    // Validar se o período de 90 dias a partir do mês selecionado é válido
    const validacao90Dias = this.validarPeriodo90DiasAPartirDoMes(dataPeriodo);
    if (!validacao90Dias.valido) {
      return validacao90Dias;
    }

    return { valido: true, mensagem: '' };
  }

  private validarPeriodoIntervalo(dataInicio?: Date, dataFim?: Date): { valido: boolean; mensagem: string } {
    if (!dataInicio || !dataFim) {
      return { valido: false, mensagem: 'Data de início e fim são obrigatórias' };
    }

    if (!this.validarLimiteHistorico(dataInicio) || !this.validarLimiteHistorico(dataFim)) {
      return { 
        valido: false, 
        mensagem: `Período deve estar dentro dos últimos ${this.configuracao.limiteMesesHistorico} meses` 
      };
    }

    if (!this.validarIntervaloDatas(dataInicio, dataFim)) {
      return { 
        valido: false, 
        mensagem: `Intervalo não pode ser superior a ${this.configuracao.limiteDiasIntervalo} dias` 
      };
    }

    return { valido: true, mensagem: '' };
  }

  /**
   * Valida se o período de 90 dias a partir do mês selecionado é válido
   */
  private validarPeriodo90DiasAPartirDoMes(dataMes: Date): { valido: boolean; mensagem: string } {
    // Calcular o último dia do mês selecionado
    const ultimoDiaDoMes = new Date(dataMes.getFullYear(), dataMes.getMonth() + 1, 0);
    
    // Calcular a data de 90 dias após o último dia do mês
    const dataLimite90Dias = new Date(ultimoDiaDoMes.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    // Verificar se a data limite de 90 dias não excede o limite histórico
    if (!this.validarLimiteHistorico(dataLimite90Dias)) {
      return {
        valido: false,
        mensagem: `O período de 90 dias a partir do mês selecionado excede o limite histórico de ${this.configuracao.limiteMesesHistorico} meses`
      };
    }
    
    // Verificar se a data limite de 90 dias não é futura
    const dataAtual = new Date();
    if (dataLimite90Dias > dataAtual) {
      return {
        valido: false,
        mensagem: 'O período de 90 dias a partir do mês selecionado não pode ser futuro'
      };
    }
    
    return { valido: true, mensagem: '' };
  }
}
