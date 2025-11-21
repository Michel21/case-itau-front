import { TestBed } from '@angular/core/testing';
import { ExtratoGeneratorCleanService } from './extrato-generator-clean.service';
import { ExtratoFactoryService } from './factories/generation-factory.service';
import { BuilderFactoryService } from './builders/config-builders.service';
import { GenerationContext } from './strategies/generation-strategies';
import { 
  DocumentConfig, 
  ExtratoData, 
  GenerationOptions,
  IPDFGenerator,
  ICSVGenerator,
  IXLSGenerator,
  IHTMLGenerator
} from './interfaces/extrato-generator-clean.interfaces';

/**
 * Testes unitários para ExtratoGeneratorCleanService
 * Demonstra a testabilidade da nova arquitetura SOLID
 */
describe('ExtratoGeneratorCleanService', () => {
  let service: ExtratoGeneratorCleanService;
  let mockFactoryService: jasmine.SpyObj<ExtratoFactoryService>;
  let mockBuilderFactory: jasmine.SpyObj<BuilderFactoryService>;
  let mockGenerationContext: jasmine.SpyObj<GenerationContext>;
  let mockPDFGenerator: jasmine.SpyObj<IPDFGenerator>;
  let mockCSVGenerator: jasmine.SpyObj<ICSVGenerator>;
  let mockXLSGenerator: jasmine.SpyObj<IXLSGenerator>;
  let mockHTMLGenerator: jasmine.SpyObj<IHTMLGenerator>;

  // Dados de teste
  const mockExtratoData: ExtratoData = {
    itens: [
      {
        data: '01/01/2024',
        descricao: 'Teste',
        valor: 100.50,
        saldo: 1000.00
      }
    ]
  };

  const mockDocumentConfig: DocumentConfig = {
    titulo: 'Extrato Teste',
    empresa: 'Empresa Teste',
    agencia: '0001',
    conta: '12345-6',
    periodo: '01/01/2024 a 31/01/2024',
    dataGeracao: new Date('2024-01-01'),
    numeroControle: 'CTRL-123456'
  };

  const mockGenerationOptions: GenerationOptions = {
    fileName: 'teste.pdf',
    includeRendaFixa: true,
    quality: 'high'
  };

  beforeEach(() => {
    // Criação de mocks
    mockPDFGenerator = jasmine.createSpyObj('IPDFGenerator', ['generatePDF']);
    mockCSVGenerator = jasmine.createSpyObj('ICSVGenerator', ['generateCSV']);
    mockXLSGenerator = jasmine.createSpyObj('IXLSGenerator', ['generateXLS']);
    mockHTMLGenerator = jasmine.createSpyObj('IHTMLGenerator', ['generateHTML']);

    mockFactoryService = jasmine.createSpyObj('ExtratoFactoryService', [
      'createPDFGenerator',
      'createCSVGenerator',
      'createXLSGenerator',
      'createHTMLGenerator'
    ]);

    mockBuilderFactory = jasmine.createSpyObj('BuilderFactoryService', [
      'createDefaultDocumentConfig',
      'createDefaultGenerationOptions',
      'createHighQualityOptions',
      'createFastOptions'
    ]);

    mockGenerationContext = jasmine.createSpyObj('GenerationContext', [
      'setStrategy',
      'execute'
    ]);

    // Configuração do TestBed
    TestBed.configureTestingModule({
      providers: [
        ExtratoGeneratorCleanService,
        { provide: ExtratoFactoryService, useValue: mockFactoryService },
        { provide: BuilderFactoryService, useValue: mockBuilderFactory },
        { provide: GenerationContext, useValue: mockGenerationContext }
      ]
    });

    service = TestBed.inject(ExtratoGeneratorCleanService);

    // Configuração de retornos dos mocks
    mockFactoryService.createPDFGenerator.and.returnValue(mockPDFGenerator);
    mockFactoryService.createCSVGenerator.and.returnValue(mockCSVGenerator);
    mockFactoryService.createXLSGenerator.and.returnValue(mockXLSGenerator);
    mockFactoryService.createHTMLGenerator.and.returnValue(mockHTMLGenerator);
  });

  describe('Criação do Serviço', () => {
    it('deve ser criado com sucesso', () => {
      expect(service).toBeTruthy();
    });

    it('deve injetar todas as dependências corretamente', () => {
      expect(mockFactoryService).toBeTruthy();
      expect(mockBuilderFactory).toBeTruthy();
      expect(mockGenerationContext).toBeTruthy();
    });
  });

  describe('Geração de PDF', () => {
    beforeEach(() => {
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
    });

    it('deve gerar PDF com sucesso', async () => {
      const result = await service.generatePDF(mockExtratoData, mockDocumentConfig, mockGenerationOptions);

      expect(result).toBe(true);
      expect(mockFactoryService.createPDFGenerator).toHaveBeenCalled();
      expect(mockGenerationContext.setStrategy).toHaveBeenCalledWith(mockPDFGenerator);
      expect(mockGenerationContext.execute).toHaveBeenCalledWith(
        mockExtratoData,
        mockDocumentConfig,
        mockGenerationOptions
      );
    });

    it('deve tratar erro de geração de PDF', async () => {
      mockGenerationContext.execute.and.returnValue(Promise.reject(new Error('Erro teste')));

      const result = await service.generatePDF(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(false);
    });

    it('deve validar dados antes da geração', async () => {
      const invalidData = { itens: null } as any;

      await expectAsync(service.generatePDF(invalidData, mockDocumentConfig))
        .toBeRejectedWithError('Dados do extrato inválidos');
    });
  });

  describe('Geração de CSV', () => {
    beforeEach(() => {
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
    });

    it('deve gerar CSV com sucesso', async () => {
      const result = await service.generateCSV(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockFactoryService.createCSVGenerator).toHaveBeenCalled();
    });
  });

  describe('Geração de XLS', () => {
    beforeEach(() => {
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
    });

    it('deve gerar XLS com sucesso', async () => {
      const result = await service.generateXLS(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockFactoryService.createXLSGenerator).toHaveBeenCalled();
    });
  });

  describe('Geração de HTML', () => {
    it('deve gerar HTML com sucesso', () => {
      const mockHTML = '<html><body>Teste</body></html>';
      mockHTMLGenerator.generateHTML.and.returnValue(mockHTML);

      const result = service.generateHTML(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(mockHTML);
      expect(mockFactoryService.createHTMLGenerator).toHaveBeenCalled();
      expect(mockHTMLGenerator.generateHTML).toHaveBeenCalledWith(
        mockExtratoData,
        mockDocumentConfig,
        undefined
      );
    });
  });

  describe('Geração por Formato', () => {
    beforeEach(() => {
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
      mockHTMLGenerator.generateHTML.and.returnValue('<html>test</html>');
    });

    it('deve gerar PDF quando formato é "pdf"', async () => {
      const result = await service.generateByFormat('pdf', mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockFactoryService.createPDFGenerator).toHaveBeenCalled();
    });

    it('deve gerar CSV quando formato é "csv"', async () => {
      const result = await service.generateByFormat('csv', mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockFactoryService.createCSVGenerator).toHaveBeenCalled();
    });

    it('deve gerar XLS quando formato é "xls"', async () => {
      const result = await service.generateByFormat('xls', mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockFactoryService.createXLSGenerator).toHaveBeenCalled();
    });

    it('deve gerar HTML quando formato é "html"', async () => {
      const result = await service.generateByFormat('html', mockExtratoData, mockDocumentConfig);

      expect(result).toBe('<html>test</html>');
      expect(mockFactoryService.createHTMLGenerator).toHaveBeenCalled();
    });

    it('deve rejeitar formato inválido', async () => {
      await expectAsync(service.generateByFormat('invalid' as any, mockExtratoData, mockDocumentConfig))
        .toBeRejectedWithError('Formato não suportado: invalid');
    });
  });

  describe('Métodos de Conveniência', () => {
    beforeEach(() => {
      mockBuilderFactory.createDefaultDocumentConfig.and.returnValue(mockDocumentConfig);
      mockBuilderFactory.createDefaultGenerationOptions.and.returnValue(mockGenerationOptions);
      mockBuilderFactory.createHighQualityOptions.and.returnValue({ ...mockGenerationOptions, quality: 'high' });
      mockBuilderFactory.createFastOptions.and.returnValue({ ...mockGenerationOptions, quality: 'low' });
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
    });

    it('deve gerar com configuração padrão', async () => {
      const result = await service.generateWithDefaultConfig('pdf', mockExtratoData);

      expect(result).toBe(true);
      expect(mockBuilderFactory.createDefaultDocumentConfig).toHaveBeenCalled();
      expect(mockBuilderFactory.createDefaultGenerationOptions).toHaveBeenCalled();
    });

    it('deve gerar com alta qualidade', async () => {
      const result = await service.generateHighQuality('pdf', mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockBuilderFactory.createHighQualityOptions).toHaveBeenCalled();
    });

    it('deve gerar rapidamente (baixa qualidade)', async () => {
      const result = await service.generateFast('pdf', mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(mockBuilderFactory.createFastOptions).toHaveBeenCalled();
    });
  });

  describe('Geração de Múltiplos Formatos', () => {
    beforeEach(() => {
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
      mockHTMLGenerator.generateHTML.and.returnValue('<html>test</html>');
    });

    it('deve gerar múltiplos formatos em paralelo', async () => {
      const formats: ('pdf' | 'csv' | 'xls' | 'html')[] = ['pdf', 'csv', 'xls', 'html'];
      const results = await service.generateMultipleFormats(formats, mockExtratoData, mockDocumentConfig);

      expect(results.size).toBe(4);
      expect(results.get('pdf')).toBe(true);
      expect(results.get('csv')).toBe(true);
      expect(results.get('xls')).toBe(true);
      expect(results.get('html')).toBe('<html>test</html>');
    });

    it('deve tratar erros individuais sem afetar outros formatos', async () => {
      mockFactoryService.createPDFGenerator.and.throwError('Erro PDF');
      const formats: ('pdf' | 'csv')[] = ['pdf', 'csv'];

      const results = await service.generateMultipleFormats(formats, mockExtratoData, mockDocumentConfig);

      expect(results.get('pdf')).toBe(false);
      expect(results.get('csv')).toBe(true);
    });
  });

  describe('Validações', () => {
    it('deve validar dados do extrato corretamente', () => {
      expect(service.validateExtratoData(mockExtratoData)).toBe(true);
      expect(service.validateExtratoData({ itens: null } as any)).toBe(false);
      expect(service.validateExtratoData(null as any)).toBe(false);
    });

    it('deve validar configuração do documento', () => {
      expect(service.validateDocumentConfig(mockDocumentConfig)).toBe(true);
      
      const invalidConfig = { ...mockDocumentConfig, titulo: '' };
      expect(service.validateDocumentConfig(invalidConfig)).toBe(false);
    });

    it('deve criar configuração validada', () => {
      const partial = { titulo: 'Teste', empresa: 'Empresa' };
      
      spyOn(service as any, 'generateControlNumber').and.returnValue('CTRL-123');
      
      const config = service.createValidatedConfig(partial);
      
      expect(config.titulo).toBe('Teste');
      expect(config.empresa).toBe('Empresa');
      expect(config.agencia).toBe('0001');
    });
  });

  describe('Métodos Utilitários', () => {
    it('deve retornar formatos suportados', () => {
      const formats = service.getSupportedFormats();
      
      expect(formats).toEqual(['pdf', 'csv', 'xls', 'html']);
    });
  });

  describe('Compatibilidade com API Anterior', () => {
    beforeEach(() => {
      mockGenerationContext.execute.and.returnValue(Promise.resolve(true));
      spyOn(console, 'warn');
    });

    it('deve manter compatibilidade com gerarPDF', async () => {
      const result = await service.gerarPDF(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('gerarPDF está depreciado. Use generatePDF.');
    });

    it('deve manter compatibilidade com gerarCSV', async () => {
      const result = await service.gerarCSV(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('gerarCSV está depreciado. Use generateCSV.');
    });

    it('deve manter compatibilidade com gerarXLS', async () => {
      const result = await service.gerarXLS(mockExtratoData, mockDocumentConfig);

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('gerarXLS está depreciado. Use generateXLS.');
    });

    it('deve manter compatibilidade com clearCache', () => {
      service.clearCache();

      expect(console.warn).toHaveBeenCalledWith('clearCache está depreciado. Cache foi removido na nova versão.');
    });
  });
});

/**
 * Testes de integração básicos
 * Demonstram o funcionamento conjunto dos componentes
 */
describe('ExtratoGeneratorCleanService - Testes de Integração', () => {
  let service: ExtratoGeneratorCleanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExtratoGeneratorCleanService,
        ExtratoFactoryService,
        BuilderFactoryService,
        GenerationContext
      ]
    });

    service = TestBed.inject(ExtratoGeneratorCleanService);
  });

  it('deve criar o serviço sem mocks (integração real)', () => {
    expect(service).toBeTruthy();
  });

  it('deve ter acesso aos formatos suportados', () => {
    const formats = service.getSupportedFormats();
    expect(formats.length).toBeGreaterThan(0);
  });

  it('deve criar configuração padrão válida', () => {
    const config = service.createValidatedConfig({});
    expect(service.validateDocumentConfig(config)).toBe(true);
  });
});
