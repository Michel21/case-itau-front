import { TestBed } from '@angular/core/testing';
import { GeradorPeriodoService } from './gerador-periodo.service';

describe('GeradorPeriodoService', () => {
  let service: GeradorPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeradorPeriodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('gerarPeriodos', () => {
    it('should generate 12 periods', () => {
      const periodos = service.gerarPeriodos();
      
      expect(periodos.length).toBe(12);
    });

    it('should generate periods with correct structure', () => {
      const periodos = service.gerarPeriodos();
      
      periodos.forEach(periodo => {
        expect(periodo).toHaveProperty('tipo');
        expect(periodo).toHaveProperty('valor');
        expect(typeof periodo.tipo).toBe('string');
        expect(typeof periodo.valor).toBe('string');
      });
    });

    it('should include current month in periods', () => {
      const periodos = service.gerarPeriodos();
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth() + 1;
      const anoAtual = dataAtual.getFullYear();
      const valorEsperado = `${mesAtual}/${anoAtual}`;
      
      const periodoAtual = periodos.find(p => p.valor === valorEsperado);
      expect(periodoAtual).toBeDefined();
    });
  });

  describe('gerarMeses', () => {
    it('should generate months in standard order (1-12)', () => {
      const meses = service.gerarMeses();
      
      expect(meses.length).toBeGreaterThan(0);
      expect(meses.length).toBeLessThanOrEqual(12);
      
      // Verificar se está ordenado por valor
      for (let i = 1; i < meses.length; i++) {
        expect(parseInt(meses[i].valor)).toBeGreaterThanOrEqual(parseInt(meses[i-1].valor));
      }
    });

    it('should generate months with correct structure', () => {
      const meses = service.gerarMeses();
      
      meses.forEach(mes => {
        expect(mes).toHaveProperty('valor');
        expect(mes).toHaveProperty('nome');
        expect(mes).toHaveProperty('ano');
        expect(typeof mes.valor).toBe('string');
        expect(typeof mes.nome).toBe('string');
        expect(typeof mes.ano).toBe('number');
        expect(parseInt(mes.valor)).toBeGreaterThanOrEqual(1);
        expect(parseInt(mes.valor)).toBeLessThanOrEqual(12);
      });
    });

    it('should not have duplicate months', () => {
      const meses = service.gerarMeses();
      const valores = meses.map(m => m.valor);
      const valoresUnicos = [...new Set(valores)];
      
      expect(valores.length).toBe(valoresUnicos.length);
    });
  });

  describe('gerarAnos', () => {
    it('should generate years based on last 12 months', () => {
      const anos = service.gerarAnos();
      
      expect(anos.length).toBeGreaterThan(0);
      expect(anos.length).toBeLessThanOrEqual(2); // Máximo 2 anos (ano atual e anterior)
      
      // Verificar se está ordenado
      for (let i = 1; i < anos.length; i++) {
        expect(parseInt(anos[i])).toBeGreaterThanOrEqual(parseInt(anos[i-1]));
      }
    });

    it('should include current year', () => {
      const anos = service.gerarAnos();
      const anoAtual = new Date().getFullYear().toString();
      
      expect(anos).toContain(anoAtual);
    });

    it('should include previous year when current month is not December', () => {
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth() + 1;
      const anos = service.gerarAnos();
      
      if (mesAtual < 12) {
        const anoAnterior = (dataAtual.getFullYear() - 1).toString();
        expect(anos).toContain(anoAnterior);
      }
    });

    it('should not have duplicate years', () => {
      const anos = service.gerarAnos();
      const anosUnicos = [...new Set(anos)];
      
      expect(anos.length).toBe(anosUnicos.length);
    });
  });
});
