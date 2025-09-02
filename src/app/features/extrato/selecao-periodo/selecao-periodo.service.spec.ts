import { TestBed } from '@angular/core/testing';
import { SelecaoPeriodoService, PeriodoMesAno } from './selecao-periodo.service';

describe('SelecaoPeriodoService', () => {
  let service: SelecaoPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelecaoPeriodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Signals initialization', () => {
    it('should initialize signals with default values', () => {
      expect(service.periodos()).toEqual([]);
      expect(service.meses()).toEqual([]);
      expect(service.anos()).toEqual([]);
      expect(service.periodoAtual()).toEqual({ mes: '', ano: '' });
    });

    it('should initialize data when service is created', () => {
      // Wait for effect to run
      setTimeout(() => {
        expect(service.periodos().length).toBe(12);
        expect(service.meses().length).toBe(12);
        expect(service.anos().length).toBe(2);
        expect(service.periodoAtual().mes).toBeTruthy();
        expect(service.periodoAtual().ano).toBeTruthy();
      }, 0);
    });
  });

  describe('gerarPeriodos', () => {
    it('should generate 12 periods', () => {
      service.gerarPeriodos();
      expect(service.periodos().length).toBe(12);
    });

    it('should generate periods with correct structure', () => {
      service.gerarPeriodos();
      const periodos = service.periodos();
      periodos.forEach(periodo => {
        expect(periodo.hasOwnProperty('tipo')).toBe(true);
        expect(periodo.hasOwnProperty('valor')).toBe(true);
        expect(typeof periodo.tipo).toBe('string');
        expect(typeof periodo.valor).toBe('string');
      });
    });

    it('should start from current month', () => {
      service.gerarPeriodos();
      const periodos = service.periodos();
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth() + 1;
      const anoAtual = dataAtual.getFullYear();
      
      expect(periodos[0].valor).toBe(`${mesAtual}/${anoAtual}`);
    });
  });

  describe('gerarMeses', () => {
    it('should generate months from last 12 months in standard order', () => {
      service.gerarMeses();
      const meses = service.meses();
      expect(meses.length).toBe(12);
      
      // Verificar se os meses estão em ordem padrão (Janeiro a Dezembro)
      expect(parseInt(meses[0].valor)).toBe(1);  // Janeiro
      expect(parseInt(meses[11].valor)).toBe(12); // Dezembro
      
      // Verificar se a ordem está correta
      for (let i = 0; i < meses.length; i++) {
        expect(parseInt(meses[i].valor)).toBe(i + 1);
      }
    });

    it('should have correct month names in standard order', () => {
      service.gerarMeses();
      const meses = service.meses();
      
      // Verificar se os meses estão em ordem padrão
      expect(meses[0].nome).toBe('Janeiro');
      expect(meses[5].nome).toBe('Junho');
      expect(meses[11].nome).toBe('Dezembro');
      
      // Verificar se todos os meses estão presentes
      const nomesEsperados = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      meses.forEach((mes, index) => {
        expect(mes.nome).toBe(nomesEsperados[index]);
      });
    });
  });

  describe('gerarAnos', () => {
    it('should generate years from last 12 months', () => {
      service.gerarAnos();
      const anos = service.anos();
      
      // Deve ter pelo menos 1 ano (ano atual)
      expect(anos.length).toBeGreaterThan(0);
      
      // Verificar se os anos são dos últimos 12 meses
      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear();
      
      // Todos os anos devem ser do ano atual ou anterior
      anos.forEach(ano => {
        const anoNum = parseInt(ano);
        expect(anoNum).toBeLessThanOrEqual(anoAtual);
        expect(anoNum).toBeGreaterThanOrEqual(anoAtual - 1);
      });
    });
  });

  describe('validarPeriodo', () => {
    it('should validate periods within last 12 months', () => {
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth() + 1;
      const anoAtual = dataAtual.getFullYear();
      
      // Período atual deve ser válido
      expect(service.validarPeriodo(mesAtual.toString(), anoAtual.toString())).toBe(true);
      
      // Período de 6 meses atrás deve ser válido
      const data6MesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 6, 1);
      expect(service.validarPeriodo(
        (data6MesesAtras.getMonth() + 1).toString(), 
        data6MesesAtras.getFullYear().toString()
      )).toBe(true);
    });

    it('should reject periods older than 12 months', () => {
      const dataAtual = new Date();
      const data13MesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 13, 1);
      
      expect(service.validarPeriodo(
        (data13MesesAtras.getMonth() + 1).toString(), 
        data13MesesAtras.getFullYear().toString()
      )).toBe(false);
    });

    it('should reject invalid month numbers', () => {
      expect(service.validarPeriodo('13', '2025')).toBe(false);
      expect(service.validarPeriodo('0', '2025')).toBe(false);
    });
  });

  describe('validarIntervaloDatas', () => {
    it('should validate intervals within 90 days', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-01-31');
      expect(service.validarIntervaloDatas(inicio, fim)).toBe(true);
    });

    it('should reject intervals over 90 days', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-04-01');
      expect(service.validarIntervaloDatas(inicio, fim)).toBe(false);
    });

    it('should validate exactly 90 days', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-03-31');
      expect(service.validarIntervaloDatas(inicio, fim)).toBe(true);
    });
  });

  describe('validarLimiteHistorico', () => {
    it('should validate dates within 12 months', () => {
      const dataAtual = new Date();
      const dataValida = new Date(dataAtual.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
      expect(service.validarLimiteHistorico(dataValida)).toBe(true);
    });

    it('should reject dates older than 12 months', () => {
      const dataAtual = new Date();
      const dataAntiga = new Date(dataAtual.getTime() - (13 * 30 * 24 * 60 * 60 * 1000));
      expect(service.validarLimiteHistorico(dataAntiga)).toBe(false);
    });

    it('should validate current date', () => {
      const dataAtual = new Date();
      expect(service.validarLimiteHistorico(dataAtual)).toBe(true);
    });
  });

  describe('validarPeriodoCompleto', () => {
    it('should validate month period correctly', () => {
      const resultado = service.validarPeriodoCompleto('mes', '6', '2025');
      expect(resultado.valido).toBe(true);
    });

    it('should validate interval period correctly', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-01-31');
      const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, inicio, fim);
      expect(resultado.valido).toBe(true);
    });

    it('should reject invalid month period', () => {
      const resultado = service.validarPeriodoCompleto('mes', '13', '2025');
      expect(resultado.valido).toBe(false);
    });

    it('should reject invalid interval period', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-04-01'); // Mais de 90 dias
      const resultado = service.validarPeriodoCompleto('intervalo', undefined, undefined, inicio, fim);
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('90 dias');
    });
  });

  describe('formatarPeriodo', () => {
    it('should format period correctly', () => {
      expect(service.formatarPeriodo('6', '2025')).toBe('Junho/2025');
      expect(service.formatarPeriodo('1', '2024')).toBe('Janeiro/2024');
      expect(service.formatarPeriodo('12', '2026')).toBe('Dezembro/2026');
    });

    it('should return empty string for invalid periods', () => {
      expect(service.formatarPeriodo('13', '2025')).toBe('');
      expect(service.formatarPeriodo('0', '2025')).toBe('');
    });
  });

  describe('formatarIntervalo', () => {
    it('should format interval correctly', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-01-31');
      const resultado = service.formatarIntervalo(inicio, fim);
      expect(resultado).toContain('01/01/2025');
      expect(resultado).toContain('31/01/2025');
    });
  });

  describe('calcularDiasEntreDatas', () => {
    it('should calculate days between dates correctly', () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-01-31');
      const dias = service.calcularDiasEntreDatas(inicio, fim);
      expect(dias).toBe(30);
    });

    it('should handle same date', () => {
      const data = new Date('2025-01-01');
      const dias = service.calcularDiasEntreDatas(data, data);
      expect(dias).toBe(0);
    });
  });

  describe('obterDataLimiteHistorico', () => {
    it('should return date 12 months ago', () => {
      const limite = service.obterDataLimiteHistorico();
      const dataAtual = new Date();
      const diferencaMeses = (dataAtual.getFullYear() - limite.getFullYear()) * 12 + 
                            (dataAtual.getMonth() - limite.getMonth());
      expect(diferencaMeses).toBeCloseTo(12, 0);
    });
  });

  describe('obterDataMaxima', () => {
    it('should return current date', () => {
      const maxima = service.obterDataMaxima();
      const dataAtual = new Date();
      expect(maxima.getDate()).toBe(dataAtual.getDate());
      expect(maxima.getMonth()).toBe(dataAtual.getMonth());
      expect(maxima.getFullYear()).toBe(dataAtual.getFullYear());
    });
  });

  describe('constants', () => {
    it('should have correct limit values', () => {
      expect(service.LIMITE_DIAS_INTERVALO).toBe(90);
      expect(service.LIMITE_MESES_HISTORICO).toBe(12);
    });
  });

  describe('Computed values', () => {
    it('should compute totalPeriodos correctly', () => {
      service.gerarPeriodos();
      expect(service.totalPeriodos()).toBe(12);
    });

    it('should compute totalMeses correctly', () => {
      service.gerarMeses();
      expect(service.totalMeses()).toBe(12);
    });

    it('should compute totalAnos correctly', () => {
      service.gerarAnos();
      expect(service.totalAnos()).toBe(2);
    });

    it('should compute periodoAtualFormatado correctly', () => {
      service.gerarMeses();
      service.gerarPeriodos();
      const periodo = service.periodoAtualFormatado();
      expect(periodo).toBeTruthy();
    });
  });

  describe('Utility methods', () => {
    it('should get month name correctly', () => {
      service.gerarMeses();
      expect(service.obterNomeMes('6')).toBe('Junho');
      expect(service.obterNomeMes('1')).toBe('Janeiro');
      expect(service.obterNomeMes('12')).toBe('Dezembro');
    });

    it('should return empty string for invalid month', () => {
      expect(service.obterNomeMes('13')).toBe('');
      expect(service.obterNomeMes('0')).toBe('');
    });

    it('should update periods', () => {
      service.atualizarPeriodos();
      expect(service.periodos().length).toBe(12);
    });

    it('should update years', () => {
      service.atualizarAnos();
      expect(service.anos().length).toBe(2);
    });

    it('should get statistics', () => {
      service.gerarPeriodos();
      service.gerarMeses();
      service.gerarAnos();
      
      const stats = service.obterEstatisticas();
      expect(stats.totalPeriodos).toBe(12);
      expect(stats.totalMeses).toBe(12);
      expect(stats.totalAnos).toBe(2);
      expect(stats.limiteDias).toBe(90);
      expect(stats.limiteMeses).toBe(12);
    });

    it('should clear all data', () => {
      service.gerarPeriodos();
      service.gerarMeses();
      service.gerarAnos();
      
      service.limparDados();
      
      expect(service.periodos().length).toBe(0);
      expect(service.meses().length).toBe(0);
      expect(service.anos().length).toBe(0);
      expect(service.periodoAtual()).toEqual({ mes: '', ano: '' });
    });
  });

  describe('Edge cases', () => {
    it('should handle year boundary correctly', () => {
      service.gerarPeriodos();
      const periodos = service.periodos();
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth() + 1;
      const anoAtual = dataAtual.getFullYear();
      
      // Should handle December to January transition
      if (mesAtual === 1) {
        expect(periodos[0].valor).toBe(`1/${anoAtual}`);
        expect(periodos[1].valor).toBe(`12/${anoAtual - 1}`);
      }
    });

    it('should handle leap year correctly', () => {
      const inicio = new Date('2024-02-29');
      const fim = new Date('2024-03-01');
      const dias = service.calcularDiasEntreDatas(inicio, fim);
      expect(dias).toBe(1);
    });
  });
});
