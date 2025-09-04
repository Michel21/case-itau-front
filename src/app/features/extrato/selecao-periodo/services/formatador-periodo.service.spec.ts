import { TestBed } from '@angular/core/testing';
import { FormatadorPeriodoService } from './formatador-periodo.service';

describe('FormatadorPeriodoService', () => {
  let service: FormatadorPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormatadorPeriodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('formatarPeriodo', () => {
    it('should format month and year correctly', () => {
      const resultado = service.formatarPeriodo('1', '2024');
      
      expect(resultado).toBe('Janeiro de 2024');
    });

    it('should return empty string for empty inputs', () => {
      const resultado = service.formatarPeriodo('', '');
      
      expect(resultado).toBe('');
    });

    it('should return empty string for null inputs', () => {
      const resultado = service.formatarPeriodo(null as any, null as any);
      
      expect(resultado).toBe('');
    });

    it('should format all months correctly', () => {
      const meses = [
        { numero: '1', nome: 'Janeiro' },
        { numero: '6', nome: 'Junho' },
        { numero: '12', nome: 'Dezembro' }
      ];

      meses.forEach(mes => {
        const resultado = service.formatarPeriodo(mes.numero, '2024');
        expect(resultado).toBe(`${mes.nome} de 2024`);
      });
    });
  });

  describe('formatarIntervalo', () => {
    it('should format date interval correctly', () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-31');
      
      const resultado = service.formatarIntervalo(dataInicio, dataFim);
      
      expect(resultado).toContain('01/01/2024');
      expect(resultado).toContain('31/01/2024');
      expect(resultado).toContain(' a ');
    });

    it('should return empty string for null dates', () => {
      const resultado = service.formatarIntervalo(null as any, null as any);
      
      expect(resultado).toBe('');
    });

    it('should return empty string for undefined dates', () => {
      const resultado = service.formatarIntervalo(undefined as any, undefined as any);
      
      expect(resultado).toBe('');
    });
  });

  describe('obterNomeMes', () => {
    it('should return correct month names', () => {
      const meses = [
        { numero: '1', nome: 'Janeiro' },
        { numero: '2', nome: 'Fevereiro' },
        { numero: '3', nome: 'Março' },
        { numero: '4', nome: 'Abril' },
        { numero: '5', nome: 'Maio' },
        { numero: '6', nome: 'Junho' },
        { numero: '7', nome: 'Julho' },
        { numero: '8', nome: 'Agosto' },
        { numero: '9', nome: 'Setembro' },
        { numero: '10', nome: 'Outubro' },
        { numero: '11', nome: 'Novembro' },
        { numero: '12', nome: 'Dezembro' }
      ];

      meses.forEach(mes => {
        const resultado = service.obterNomeMes(mes.numero);
        expect(resultado).toBe(mes.nome);
      });
    });

    it('should return empty string for invalid month numbers', () => {
      expect(service.obterNomeMes('0')).toBe('');
      expect(service.obterNomeMes('13')).toBe('');
      expect(service.obterNomeMes('')).toBe('');
      expect(service.obterNomeMes('abc')).toBe('');
    });

    it('should return empty string for null input', () => {
      const resultado = service.obterNomeMes(null as any);
      
      expect(resultado).toBe('');
    });
  });
});
