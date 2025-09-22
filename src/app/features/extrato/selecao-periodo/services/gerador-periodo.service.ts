import { Injectable } from '@angular/core';
import { IGeradorPeriodo } from '../interfaces/gerador.interface';
import { Mes, PeriodoMesAno, ConfiguracaoPeriodo } from '../interfaces/periodo.interface';

/**
 * Serviço responsável apenas pela geração de dados de período (Single Responsibility Principle)
 * - SRP: Responsável exclusivamente por gerar dados de período
 * - Open/Closed: Aberto para extensão, fechado para modificação
 * - Liskov Substitution: Pode ser substituído por outras implementações de IGeradorPeriodo
 */
@Injectable({
  providedIn: 'root'
})
export class GeradorPeriodoService implements IGeradorPeriodo {
  private readonly LIMITE_MESES_HISTORICO = 12;

  gerarPeriodos(): PeriodoMesAno[] {
    const periodos: PeriodoMesAno[] = [];
    const dataAtual = new Date();
    
    for (let i = 0; i < this.LIMITE_MESES_HISTORICO; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      
      periodos.push({
        tipo: 'mes',
        valor: `${mes}/${ano}`,
        mes: mes.toString(),
        ano: ano.toString()
      });
    }
    
    return periodos;
  }

  gerarMeses(): Mes[] {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1; // Mês atual (1-12)
    const anoAtual = dataAtual.getFullYear();
    
    // Gerar array de 12 meses (1 a 12)
    const meses = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1; // Meses de 1 a 12
      return {
        valor: mes.toString(),
        nome: this.obterNomeMesPorNumero(mes),
        ano: mes > mesAtual ? anoAtual - 1 : anoAtual
      };
    });
    
    // Filtrar apenas os meses dos últimos 12 meses
    const mesesFiltrados = meses.filter(mes => {
      const dataMes = new Date(mes.ano, Number(mes.valor) - 1, 1);
      return dataMes >= new Date(anoAtual - 1, mesAtual - 1, 1);
    });
    
    return mesesFiltrados;
  }

  gerarAnos(): string[] {
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const anosSet = new Set<string>();
    
    // Gerar anos dos últimos 12 meses
    for (let i = 0; i < this.LIMITE_MESES_HISTORICO; i++) {
      const data = new Date(anoAtual, dataAtual.getMonth() - i, 1);
      anosSet.add(data.getFullYear().toString());
    }
    
    return Array.from(anosSet).sort((a, b) => parseInt(a) - parseInt(b));
  }

  /**
   * Gera períodos no formato "Ano | Mês" para dropdown único
   * Retorna lista ordenada do mais recente para o mais antigo
   */
  gerarPeriodosDropdown(): Array<{ valor: string; label: string; mes: string; ano: string }> {
    const dataAtual = new Date();
    const periodos: Array<{ valor: string; label: string; mes: string; ano: string }> = [];
    
    // Gerar os últimos 12 meses incluindo futuro conforme imagem
    for (let i = -3; i < 12; i++) { // -3 para incluir 3 meses futuros
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      const nomeMes = this.obterNomeMesPorNumero(mes);
      
      periodos.push({
        valor: `${mes}/${ano}`,
        label: `${ano} | ${nomeMes}`,
        mes: mes.toString(),
        ano: ano.toString()
      });
    }
    
    // Ordenar do mais recente para o mais antigo
    return periodos.sort((a, b) => {
      const dataA = new Date(parseInt(a.ano), parseInt(a.mes) - 1);
      const dataB = new Date(parseInt(b.ano), parseInt(b.mes) - 1);
      return dataB.getTime() - dataA.getTime();
    });
  }

  gerarPeriodoAtual(): { mes: string; ano: string } {
    const dataAtual = new Date();
    return {
      mes: (dataAtual.getMonth() + 1).toString(),
      ano: dataAtual.getFullYear().toString()
    };
  }

  gerarPeriodosComConfiguracao(configuracao: ConfiguracaoPeriodo): PeriodoMesAno[] {
    const periodos: PeriodoMesAno[] = [];
    const dataAtual = new Date();
    
    for (let i = 0; i < configuracao.limiteMesesHistorico; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      
      periodos.push({
        tipo: 'mes',
        valor: `${mes}/${ano}`,
        mes: mes.toString(),
        ano: ano.toString()
      });
    }
    
    return periodos;
  }

  private obterNomeMesPorNumero(numeroMes: number): string {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return nomesMeses[numeroMes - 1] || '';
  }
}
