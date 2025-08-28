# Service Extrato PDF - Documentação

## 🎯 **Objetivo**
Criar um service Angular para gerenciar toda a lógica de geração de PDFs, exportação de dados e formatação, separando as responsabilidades do componente e facilitando a manutenção.

## 🏗️ **Arquitetura Implementada**

### **📁 Estrutura de Arquivos**
```
extrato-pdf/
├── extrato-pdf.service.ts      # Service principal
├── extrato-pdf.component.ts    # Componente simplificado
├── extrato-pdf.component.html  # Template
├── extrato-pdf.component.css   # Estilos
└── extrato-format.pipe.ts      # Pipe de formatação
```

### **🔧 Responsabilidades do Service**

#### **1. Geração de PDFs**
- ✅ **PDF Corporativo**: Usando jsPDF com layout profissional
- ✅ **PDF Print**: Fallback usando print do navegador
- ✅ **Configuração**: Criação automática de configurações

#### **2. Exportação de Dados**
- ✅ **CSV**: Geração com encoding UTF-8 e formatação brasileira
- ✅ **HTML**: Exportação completa com estilos inline
- ✅ **Formatação**: Conversão de dados para diferentes formatos

#### **3. Gerenciamento de Interfaces**
- ✅ **ExtratoItem**: Interface para itens do extrato
- ✅ **ExtratoSecao**: Interface para seções com totais
- ✅ **ExtratoDados**: Interface principal dos dados
- ✅ **PDFConfig**: Interface para configuração do PDF

## 🛠️ **Implementação do Service**

### **Service Principal**
```typescript
@Injectable({
  providedIn: 'root'
})
export class ExtratoPdfService {
  
  // Métodos públicos
  async gerarPDFCorporativo(dados: ExtratoDados, config: PDFConfig): Promise<void>
  gerarPDFPrint(): void
  exportarHTML(dados: ExtratoDados, config: PDFConfig): void
  gerarCSV(dados: ExtratoDados, config: PDFConfig): void
  criarConfigPDF(dataTransacao: string, numeroControle: string): PDFConfig
  
  // Métodos privados
  private async gerarPDFComJsPDF(dados: ExtratoDados, config: PDFConfig): Promise<void>
  private adicionarCabecalhoPDF(pdf: any, config: PDFConfig, margin: number, pageWidth: number): void
  private adicionarInformacoesRelatorio(pdf: any, config: PDFConfig, margin: number): void
  private adicionarDetalhesEmpresa(pdf: any, dados: ExtratoDados, margin: number): void
  private adicionarRodapePDF(pdf: any, margin: number, pageHeight: number): void
  private adicionarSecaoPDF(pdf: any, titulo: string, secao: ExtratoSecao | undefined, yPosition: number, pageWidth: number, margin: number): number
  private converterParaCSV(dados: ExtratoDados): string
  private itemParaCSV(secao: string, item: ExtratoItem): string
  private totaisParaCSV(secao: string, dados: ExtratoSecao): string
  private getCSSStyles(): string
  private formatarData(data: string): string
  private formatarMoeda(valor: number): string
}
```

### **Interfaces Definidas**
```typescript
export interface ExtratoItem {
  dataAplicacao: string;
  dataVencimento: string;
  dataResgate: string;
  taxa: number;
  valorPrincipal: number;
  valorBruto: number;
  rendaTotal: number;
  iof: number;
  irrf: number;
  valorLiquido: number;
  rendaBrutaPer: number;
}

export interface ExtratoSecao {
  dataSaldo?: string;
  itens: ExtratoItem[];
  totalValorPrincipal: number;
  totalValorBruto: number;
  totalRendaTotal: number;
  totalIof: number;
  totalIrrf: number;
  totalValorLiquido: number;
  totalRendaBrutaPer: number;
}

export interface ExtratoDados {
  empresa: string;
  agencia: string;
  dataBusca: string;
  tipoInvestimento: string;
  tipoProduto: string;
  saldoAnterior?: ExtratoSecao;
  aplicacoes?: ExtratoSecao;
  resgates?: ExtratoSecao;
  saldoFinal?: ExtratoSecao;
}

export interface PDFConfig {
  title: string;
  subtitle: string;
  dataTransacao: string;
  numeroControle: string;
  fileName: string;
}
```

## 📋 **Como Usar o Service**

### **1. Injeção no Componente**
```typescript
import { ExtratoPdfService, ExtratoDados } from './extrato-pdf.service';

@Component({
  selector: 'app-extrato-pdf',
  templateUrl: './extrato-pdf.component.html',
  styleUrls: ['./extrato-pdf.component.css']
})
export class ExtratoPdfComponent implements OnInit {
  
  constructor(private extratoPdfService: ExtratoPdfService) { }
  
  // Métodos do componente
}
```

### **2. Geração de PDF Corporativo**
```typescript
async gerarPDFCorporativo(): Promise<void> {
  try {
    const config = this.extratoPdfService.criarConfigPDF(
      this.dataTransacao, 
      this.numeroControle
    );
    await this.extratoPdfService.gerarPDFCorporativo(this.dadosAtuais, config);
  } catch (error) {
    console.error('Erro ao gerar PDF corporativo:', error);
  }
}
```

### **3. Geração de PDF Print**
```typescript
gerarPDF(): void {
  this.extratoPdfService.gerarPDFPrint();
}
```

### **4. Exportação HTML**
```typescript
exportarHTML(): void {
  const config = this.extratoPdfService.criarConfigPDF(
    this.dataTransacao, 
    this.numeroControle
  );
  this.extratoPdfService.exportarHTML(this.dadosAtuais, config);
}
```

### **5. Geração CSV**
```typescript
gerarCSV(): void {
  const config = this.extratoPdfService.criarConfigPDF(
    this.dataTransacao, 
    this.numeroControle
  );
  this.extratoPdfService.gerarCSV(this.dadosAtuais, config);
}
```

## 🎨 **Vantagens da Arquitetura Service**

### **✅ Separação de Responsabilidades**
- **Componente**: Apenas lógica de apresentação e interação
- **Service**: Toda lógica de negócio e geração de arquivos
- **Interfaces**: Tipagem forte e reutilizável

### **✅ Reutilização**
- Service pode ser usado em múltiplos componentes
- Interfaces podem ser importadas em outros módulos
- Métodos são independentes e testáveis

### **✅ Manutenibilidade**
- Código organizado e bem estruturado
- Fácil de testar individualmente
- Mudanças centralizadas no service

### **✅ Testabilidade**
- Service pode ser testado isoladamente
- Mock fácil para testes de componentes
- Métodos pequenos e focados

### **✅ Escalabilidade**
- Fácil adicionar novos formatos de exportação
- Configurações centralizadas
- Extensível para novos recursos

## 🔧 **Métodos do Service**

### **Métodos Públicos**

#### **gerarPDFCorporativo()**
```typescript
async gerarPDFCorporativo(dados: ExtratoDados, config: PDFConfig): Promise<void>
```
- Gera PDF corporativo usando jsPDF
- Fallback para print se jsPDF não estiver disponível
- Tratamento de erros com fallback

#### **gerarPDFPrint()**
```typescript
gerarPDFPrint(): void
```
- Gera PDF usando print do navegador
- Esconde botões antes de imprimir
- Restaura botões após impressão

#### **exportarHTML()**
```typescript
exportarHTML(dados: ExtratoDados, config: PDFConfig): void
```
- Exporta dados como arquivo HTML
- Inclui estilos CSS inline
- Nome do arquivo baseado na configuração

#### **gerarCSV()**
```typescript
gerarCSV(dados: ExtratoDados, config: PDFConfig): void
```
- Gera arquivo CSV com encoding UTF-8
- Formatação brasileira (vírgula como separador decimal)
- BOM para compatibilidade com Excel

#### **criarConfigPDF()**
```typescript
criarConfigPDF(dataTransacao: string, numeroControle: string): PDFConfig
```
- Cria configuração padrão para PDF
- Gera nome do arquivo automaticamente
- Configurações corporativas padrão

### **Métodos Privados**

#### **gerarPDFComJsPDF()**
- Implementação principal do PDF corporativo
- Configuração de layout e formatação
- Geração de seções e tabelas

#### **adicionarCabecalhoPDF()**
- Adiciona cabeçalho corporativo
- Logo e subtítulo
- Linha separadora

#### **adicionarInformacoesRelatorio()**
- Adiciona informações do relatório
- Data da transação e número de controle
- Título do documento

#### **adicionarDetalhesEmpresa()**
- Adiciona detalhes da empresa
- CNPJ, agência, conta
- Tipo de investimento e produto

#### **adicionarRodapePDF()**
- Adiciona rodapé institucional
- Informações de contato
- Disclaimer corporativo

#### **adicionarSecaoPDF()**
- Adiciona seção de dados ao PDF
- Cabeçalho da tabela
- Dados e totais
- Quebra de página automática

## 📊 **Exemplo de Uso Completo**

### **1. Configuração do Módulo**
```typescript
// app.module.ts
import { ExtratoPdfService } from './extrato-pdf/extrato-pdf.service';

@NgModule({
  providers: [ExtratoPdfService],
  // ...
})
export class AppModule { }
```

### **2. Componente Simplificado**
```typescript
// extrato-pdf.component.ts
export class ExtratoPdfComponent {
  constructor(private extratoPdfService: ExtratoPdfService) { }

  async gerarPDFCorporativo(): Promise<void> {
    const config = this.extratoPdfService.criarConfigPDF(
      this.dataTransacao, 
      this.numeroControle
    );
    await this.extratoPdfService.gerarPDFCorporativo(this.dadosAtuais, config);
  }

  gerarCSV(): void {
    const config = this.extratoPdfService.criarConfigPDF(
      this.dataTransacao, 
      this.numeroControle
    );
    this.extratoPdfService.gerarCSV(this.dadosAtuais, config);
  }
}
```

### **3. Template HTML**
```html
<!-- extrato-pdf.component.html -->
<button (click)="gerarPDFCorporativo()" class="btn btn-primary">
  <i class="icon-pdf"></i> PDF Corporativo
</button>

<button (click)="gerarCSV()" class="btn btn-success">
  <i class="icon-csv"></i> Exportar CSV
</button>
```

## 🧪 **Testes do Service**

### **Teste Unitário**
```typescript
// extrato-pdf.service.spec.ts
describe('ExtratoPdfService', () => {
  let service: ExtratoPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtratoPdfService);
  });

  it('should create config PDF', () => {
    const config = service.criarConfigPDF('25/08/2025', '123456');
    expect(config.title).toBe('BRADESCO CORPORATE');
    expect(config.fileName).toContain('extrato_bradesco_25082025.pdf');
  });

  it('should generate CSV content', () => {
    const dados: ExtratoDados = { /* mock data */ };
    const config = service.criarConfigPDF('25/08/2025', '123456');
    expect(() => service.gerarCSV(dados, config)).not.toThrow();
  });
});
```

## 🚀 **Próximos Passos**

### **Melhorias Futuras**
- [ ] **Cache de configurações**: Reutilizar configurações comuns
- [ ] **Templates personalizáveis**: Múltiplos layouts de PDF
- [ ] **Compressão de arquivos**: Otimizar tamanho dos PDFs
- [ ] **Assinatura digital**: Adicionar certificados
- [ ] **Watermark**: Marca d'água corporativa
- [ ] **Internacionalização**: Suporte a múltiplos idiomas
- [ ] **Testes E2E**: Testes completos de funcionalidade
- [ ] **Documentação API**: Swagger/OpenAPI

---

**Service implementado e documentado!** ✅
