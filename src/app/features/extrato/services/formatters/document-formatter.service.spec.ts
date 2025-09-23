import { TestBed } from '@angular/core/testing';
import { DocumentFormatterService } from './document-formatter.service';

describe('DocumentFormatterService', () => {
  let service: DocumentFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentFormatterService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('formatCurrency', () => {
    it('deve formatar valor monetário corretamente', () => {
      const valor = 1234.56;
      const resultado = service.formatCurrency(valor);
      
      expect(resultado).toBe('1.234,56');
    });

    it('deve formatar valor zero', () => {
      const valor = 0;
      const resultado = service.formatCurrency(valor);
      
      expect(resultado).toBe('0,00');
    });

    it('deve formatar valor negativo', () => {
      const valor = -500.75;
      const resultado = service.formatCurrency(valor);
      
      expect(resultado).toBe('-500,75');
    });

    it('deve respeitar locale americano', () => {
      const valor = 1234.56;
      const resultado = service.formatCurrency(valor, 'en-US');
      
      expect(resultado).toBe('1,234.56');
    });

    it('deve manter duas casas decimais mesmo para números inteiros', () => {
      const valor = 1000;
      const resultado = service.formatCurrency(valor);
      
      expect(resultado).toBe('1.000,00');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data no padrão brasileiro', () => {
      const data = new Date('2023-12-25T10:30:00');
      const resultado = service.formatDate(data);
      
      expect(resultado).toBe('25/12/2023');
    });

    it('deve formatar data com opções customizadas', () => {
      const data = new Date('2023-12-25T10:30:00');
      const opcoes = { 
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const 
      };
      const resultado = service.formatDate(data, 'pt-BR', opcoes);
      
      expect(resultado).toContain('dezembro');
      expect(resultado).toContain('2023');
    });

    it('deve respeitar locale americano', () => {
      const data = new Date('2023-12-25T10:30:00');
      const resultado = service.formatDate(data, 'en-US');
      
      expect(resultado).toBe('12/25/2023');
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data e hora no padrão brasileiro', () => {
      const data = new Date('2023-12-25T14:30:45');
      const resultado = service.formatDateTime(data);
      
      expect(resultado).toContain('25/12/2023');
      expect(resultado).toContain('14:30');
    });

    it('deve respeitar locale americano', () => {
      const data = new Date('2023-12-25T14:30:45');
      const resultado = service.formatDateTime(data, 'en-US');
      
      expect(resultado).toContain('12/25/2023');
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar percentual com 2 casas decimais padrão', () => {
      const valor = 15.5;
      const resultado = service.formatPercentage(valor);
      
      expect(resultado).toBe('15,50%');
    });

    it('deve formatar percentual com casas decimais customizadas', () => {
      const valor = 15.567;
      const resultado = service.formatPercentage(valor, 3);
      
      expect(resultado).toBe('15,567%');
    });

    it('deve formatar percentual zero', () => {
      const valor = 0;
      const resultado = service.formatPercentage(valor);
      
      expect(resultado).toBe('0,00%');
    });

    it('deve formatar percentual negativo', () => {
      const valor = -5.25;
      const resultado = service.formatPercentage(valor);
      
      expect(resultado).toBe('-5,25%');
    });
  });

  describe('formatTime', () => {
    it('deve formatar hora no padrão HH:mm', () => {
      const data = new Date('2023-12-25T14:30:45');
      const resultado = service.formatTime(data);
      
      expect(resultado).toBe('14:30');
    });

    it('deve formatar hora da manhã com zero à esquerda', () => {
      const data = new Date('2023-12-25T08:05:00');
      const resultado = service.formatTime(data);
      
      expect(resultado).toBe('08:05');
    });
  });

  describe('formatNumber', () => {
    it('deve formatar número simples', () => {
      const valor = 1234.56;
      const resultado = service.formatNumber(valor);
      
      expect(resultado).toBe('1.234,56');
    });

    it('deve formatar número com opções customizadas', () => {
      const valor = 1234.567;
      const opcoes = { 
        minimumFractionDigits: 3, 
        maximumFractionDigits: 3 
      };
      const resultado = service.formatNumber(valor, opcoes);
      
      expect(resultado).toBe('1.234,567');
    });

    it('deve formatar número inteiro sem decimais', () => {
      const valor = 1000;
      const opcoes = { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      };
      const resultado = service.formatNumber(valor, opcoes);
      
      expect(resultado).toBe('1.000');
    });
  });

  describe('formatTemplate', () => {
    it('deve substituir placeholders simples', () => {
      const template = 'Olá {{nome}}, você tem {{idade}} anos';
      const dados = { nome: 'João', idade: 30 };
      const resultado = service.formatTemplate(template, dados);
      
      expect(resultado).toBe('Olá João, você tem 30 anos');
    });

    it('deve manter placeholders não encontrados', () => {
      const template = 'Olá {{nome}}, sua cidade é {{cidade}}';
      const dados = { nome: 'João' };
      const resultado = service.formatTemplate(template, dados);
      
      expect(resultado).toBe('Olá João, sua cidade é {{cidade}}');
    });

    it('deve processar template vazio', () => {
      const template = '';
      const dados = { nome: 'João' };
      const resultado = service.formatTemplate(template, dados);
      
      expect(resultado).toBe('');
    });

    it('deve processar template sem placeholders', () => {
      const template = 'Texto sem placeholders';
      const dados = { nome: 'João' };
      const resultado = service.formatTemplate(template, dados);
      
      expect(resultado).toBe('Texto sem placeholders');
    });
  });

  describe('capitalize', () => {
    it('deve capitalizar primeira letra', () => {
      const texto = 'joão';
      const resultado = service.capitalize(texto);
      
      expect(resultado).toBe('João');
    });

    it('deve capitalizar e deixar resto minúsculo', () => {
      const texto = 'jOÃO';
      const resultado = service.capitalize(texto);
      
      expect(resultado).toBe('João');
    });

    it('deve processar string vazia', () => {
      const texto = '';
      const resultado = service.capitalize(texto);
      
      expect(resultado).toBe('');
    });

    it('deve processar string com um caractere', () => {
      const texto = 'a';
      const resultado = service.capitalize(texto);
      
      expect(resultado).toBe('A');
    });
  });

  describe('toTitleCase', () => {
    it('deve capitalizar todas as palavras', () => {
      const texto = 'joão da silva';
      const resultado = service.toTitleCase(texto);
      
      expect(resultado).toBe('João Da Silva');
    });

    it('deve processar palavra única', () => {
      const texto = 'joão';
      const resultado = service.toTitleCase(texto);
      
      expect(resultado).toBe('João');
    });

    it('deve processar string vazia', () => {
      const texto = '';
      const resultado = service.toTitleCase(texto);
      
      expect(resultado).toBe('');
    });

    it('deve processar texto com espaços extras', () => {
      const texto = '  joão   da   silva  ';
      const resultado = service.toTitleCase(texto);
      
      expect(resultado).toBe('  João   Da   Silva  ');
    });

    it('deve processar texto misto de maiúsculas e minúsculas', () => {
      const texto = 'jOÃO DA sILVA';
      const resultado = service.toTitleCase(texto);
      
      expect(resultado).toBe('João Da Silva');
    });
  });

  describe('Cenários de Edge Cases', () => {
    it('deve lidar com valores undefined em formatCurrency', () => {
      const resultado = service.formatCurrency(undefined as any);
      expect(resultado).toBe('NaN');
    });

    it('deve lidar com datas inválidas', () => {
      const dataInvalida = new Date('data inválida');
      const resultado = service.formatDate(dataInvalida);
      expect(resultado).toContain('Invalid Date');
    });

    it('deve lidar com valores muito grandes', () => {
      const valorGrande = 999999999999.99;
      const resultado = service.formatCurrency(valorGrande);
      expect(resultado).toBe('999.999.999.999,99');
    });

    it('deve lidar com percentuais muito pequenos', () => {
      const valorPequeno = 0.001;
      const resultado = service.formatPercentage(valorPequeno, 4);
      expect(resultado).toBe('0,0010%');
    });
  });

  describe('Performance e Consistência', () => {
    it('deve produzir resultados consistentes para o mesmo valor', () => {
      const valor = 1234.56;
      const resultado1 = service.formatCurrency(valor);
      const resultado2 = service.formatCurrency(valor);
      
      expect(resultado1).toBe(resultado2);
    });

    it('deve formatar múltiplos valores rapidamente', () => {
      const valores = Array.from({ length: 1000 }, (_, i) => i * 1.23);
      const inicio = performance.now();
      
      valores.forEach(valor => service.formatCurrency(valor));
      
      const fim = performance.now();
      const tempoGasto = fim - inicio;
      
      // Deve completar em menos de 100ms
      expect(tempoGasto).toBeLessThan(100);
    });
  });
});
