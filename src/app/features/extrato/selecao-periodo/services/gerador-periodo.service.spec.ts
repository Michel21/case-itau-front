import { TestBed } from '@angular/core/testing';
import { GeradorPeriodoService } from './gerador-periodo.service';
import { ConfiguracaoPeriodo } from '../interfaces/periodo.interface';

/**
 * Testes unitários para GeradorPeriodoService
 * Seguindo princípios SOLID e Clean Code
 */
describe('GeradorPeriodoService', () => {
  let service: GeradorPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeradorPeriodoService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('gerarPeriodos', () => {
    it('deve gerar 12 períodos', () => {
      const periodos = service.gerarPeriodos();
      
      expect(periodos.length).toBe(12);
    });

    it('deve gerar períodos com estrutura correta', () => {
      const periodos = service.gerarPeriodos();
      const primeiroPeriodo = periodos[0];
      
      expect(primeiroPeriodo.tipo).toBe('mes');
      expect(primeiroPeriodo.valor).toBeDefined();
      expect(primeiroPeriodo.mes).toBeDefined();
      expect(primeiroPeriodo.ano).toBeDefined();
    });

    it('deve gerar períodos em ordem decrescente (mais recente primeiro)', () => {
      const periodos = service.gerarPeriodos();
      const dataAtual = new Date();
      const primeiroPeriodo = periodos[0];
      
      expect(primeiroPeriodo.mes).toBe((dataAtual.getMonth() + 1).toString());
      expect(primeiroPeriodo.ano).toBe(dataAtual.getFullYear().toString());
    });

    it('deve gerar períodos com valores válidos de mês e ano', () => {
      const periodos = service.gerarPeriodos();
      
      periodos.forEach(periodo => {
        expect(parseInt(periodo.mes!)).toBeGreaterThanOrEqual(1);
        expect(parseInt(periodo.mes!)).toBeLessThanOrEqual(12);
        expect(parseInt(periodo.ano!)).toBeGreaterThan(0);
      });
    });
  });

  describe('gerarMeses', () => {
    it('deve gerar array de meses', () => {
      const meses = service.gerarMeses();
      
      expect(Array.isArray(meses)).toBe(true);
      expect(meses.length).toBeGreaterThan(0);
    });

    it('deve gerar meses com estrutura correta', () => {
      const meses = service.gerarMeses();
      const primeiroMes = meses[0];
      
      expect(primeiroMes.valor).toBeDefined();
      expect(primeiroMes.nome).toBeDefined();
      expect(primeiroMes.ano).toBeDefined();
    });

    it('deve gerar meses com valores válidos', () => {
      const meses = service.gerarMeses();
      
      meses.forEach(mes => {
        expect(parseInt(mes.valor)).toBeGreaterThanOrEqual(1);
        expect(parseInt(mes.valor)).toBeLessThanOrEqual(12);
        expect(mes.nome).toBeTruthy();
        expect(mes.ano).toBeGreaterThan(0);
      });
    });

    it('deve gerar meses com nomes corretos', () => {
      const meses = service.gerarMeses();
      const nomesEsperados = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      meses.forEach(mes => {
        expect(nomesEsperados).toContain(mes.nome);
      });
    });
  });

  describe('gerarAnos', () => {
    it('deve gerar array de anos', () => {
      const anos = service.gerarAnos();
      
      expect(Array.isArray(anos)).toBe(true);
      expect(anos.length).toBeGreaterThan(0);
    });

    it('deve gerar anos como strings', () => {
      const anos = service.gerarAnos();
      
      anos.forEach(ano => {
        expect(typeof ano).toBe('string');
        expect(parseInt(ano)).toBeGreaterThan(0);
      });
    });

    it('deve gerar anos em ordem crescente', () => {
      const anos = service.gerarAnos();
      
      for (let i = 1; i < anos.length; i++) {
        expect(parseInt(anos[i])).toBeGreaterThanOrEqual(parseInt(anos[i - 1]));
      }
    });

    it('deve incluir ano atual', () => {
      const anos = service.gerarAnos();
      const anoAtual = new Date().getFullYear().toString();
      
      expect(anos).toContain(anoAtual);
    });
  });

  describe('gerarPeriodoAtual', () => {
    it('deve gerar período atual', () => {
      const periodoAtual = service.gerarPeriodoAtual();
      
      expect(periodoAtual.mes).toBeDefined();
      expect(periodoAtual.ano).toBeDefined();
    });

    it('deve gerar mês e ano atuais', () => {
      const periodoAtual = service.gerarPeriodoAtual();
      const dataAtual = new Date();
      
      expect(periodoAtual.mes).toBe((dataAtual.getMonth() + 1).toString());
      expect(periodoAtual.ano).toBe(dataAtual.getFullYear().toString());
    });

    it('deve gerar valores válidos de mês e ano', () => {
      const periodoAtual = service.gerarPeriodoAtual();
      
      expect(parseInt(periodoAtual.mes)).toBeGreaterThanOrEqual(1);
      expect(parseInt(periodoAtual.mes)).toBeLessThanOrEqual(12);
      expect(parseInt(periodoAtual.ano)).toBeGreaterThan(0);
    });
  });

  describe('gerarPeriodosComConfiguracao', () => {
    it('deve gerar períodos baseados na configuração', () => {
      const configuracao: ConfiguracaoPeriodo = {
        limiteDiasIntervalo: 90,
        limiteMesesHistorico: 6,
        permitirDatasFuturas: false
      };
      
      const periodos = service.gerarPeriodosComConfiguracao(configuracao);
      
      expect(periodos.length).toBe(6);
    });

    it('deve gerar períodos com estrutura correta using configuration', () => {
      const configuracao: ConfiguracaoPeriodo = {
        limiteDiasIntervalo: 90,
        limiteMesesHistorico: 3,
        permitirDatasFuturas: false
      };
      
      const periodos = service.gerarPeriodosComConfiguracao(configuracao);
      const primeiroPeriodo = periodos[0];
      
      expect(primeiroPeriodo.tipo).toBe('mes');
      expect(primeiroPeriodo.valor).toBeDefined();
      expect(primeiroPeriodo.mes).toBeDefined();
      expect(primeiroPeriodo.ano).toBeDefined();
    });

    it('deve respeitar limites da configuração', () => {
      const configuracao: ConfiguracaoPeriodo = {
        limiteDiasIntervalo: 90,
        limiteMesesHistorico: 1,
        permitirDatasFuturas: false
      };
      
      const periodos = service.gerarPeriodosComConfiguracao(configuracao);
      
      expect(periodos.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('deve lidar corretamente com limite de ano', () => {
      // Test with current date to verify the logic works
      const periodos = service.gerarPeriodos();
      
      // Should generate 12 periods
      expect(periodos.length).toBe(12);
      
      // Should include current month and previous months
      const meses = periodos.map(p => parseInt(p.mes!));
      const anos = periodos.map(p => parseInt(p.ano!));
      
      // All months should be valid (1-12)
      expect(meses.every(mes => mes >= 1 && mes <= 12)).toBe(true);
      
      // All years should be valid (current year or previous year)
      const anoAtual = new Date().getFullYear();
      expect(anos.every(ano => ano >= anoAtual - 1 && ano <= anoAtual)).toBe(true);
      
      // Should have unique combinations
      const combinacoes = periodos.map(p => `${p.mes}/${p.ano}`);
      const combinacoesUnicas = [...new Set(combinacoes)];
      expect(combinacoesUnicas.length).toBe(12);
    });

    it('deve lidar corretamente com ano bissexto', () => {
      // Mock current date to be in a leap year
      const originalDate = Date;
      const mockDate = new Date(2024, 1, 29); // Fevereiro 29, 2024
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;
      
      const periodos = service.gerarPeriodos();
      
      expect(periodos.length).toBe(12);
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});
