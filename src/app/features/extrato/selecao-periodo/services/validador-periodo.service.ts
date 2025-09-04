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
    
    // Validar se o período de 90 dias a partir do mês selecionado é válido (primeiro)
    const validacao90Dias = this.validarPeriodo90DiasAPartirDoMes(dataPeriodo);
    if (!validacao90Dias.valido) {
      return validacao90Dias;
    }

    // Validar limite histórico (segundo)
    if (!this.validarLimiteHistorico(dataPeriodo)) {
      return { 
        valido: false, 
        mensagem: `Período deve estar dentro dos últimos ${this.configuracao.limiteMesesHistorico} meses` 
      };
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
   * Valida se o mês selecionado está dentro do período de 90 dias do mês atual
   * Regra: O mês selecionado não pode estar a mais de 90 dias do mês atual
   * Exemplo: Se estamos em setembro, maio está a mais de 90 dias → inválido
   */
  private validarPeriodo90DiasAPartirDoMes(dataMes: Date): { valido: boolean; mensagem: string } {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    // Se o mês selecionado for o mês atual, não aplicar validação de 90 dias
    if (dataMes.getMonth() === mesAtual && dataMes.getFullYear() === anoAtual) {
      return { valido: true, mensagem: '' };
    }
    
    // Calcular o primeiro dia do mês atual
    const primeiroDiaMesAtual = new Date(anoAtual, mesAtual, 1);
    
    // Calcular o último dia do mês selecionado
    const ultimoDiaMesSelecionado = new Date(dataMes.getFullYear(), dataMes.getMonth() + 1, 0);
    
    // Calcular a diferença em dias entre o último dia do mês selecionado e o primeiro dia do mês atual
    const diferencaEmDias = Math.abs(ultimoDiaMesSelecionado.getTime() - primeiroDiaMesAtual.getTime()) / (1000 * 60 * 60 * 24);
    
    // Verificar se a diferença excede 90 dias
    if (diferencaEmDias > 90) {
      return {
        valido: false,
        mensagem: `O mês selecionado está fora do período de 90 dias do mês atual.`
      };
    }
    
    // Verificar se o mês selecionado não é muito antigo (deve estar dentro dos últimos 12 meses)
    const primeiroDiaDoMes = new Date(dataMes.getFullYear(), dataMes.getMonth(), 1);
    const dataLimiteHistorico = new Date(anoAtual, mesAtual - this.configuracao.limiteMesesHistorico, 1);
    
    if (primeiroDiaDoMes < dataLimiteHistorico) {
      return {
        valido: false,
        mensagem: `O mês selecionado deve estar dentro dos últimos ${this.configuracao.limiteMesesHistorico} meses.`
      };
    }
    
    return { valido: true, mensagem: '' };
  }
}
