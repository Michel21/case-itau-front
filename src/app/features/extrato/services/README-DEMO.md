# 🚀 Demo ExtratoGeneratorService

## 📋 Visão Geral

Este demo demonstra o uso do `ExtratoGeneratorService` para gerar relatórios de extrato bancário em diferentes formatos (PDF, CSV, HTML) de forma independente do template HTML.

## 🎯 Funcionalidades Demonstradas

### ✅ Geração de Arquivos
- **PDF**: Geração de PDF com jsPDF e html2canvas
- **CSV**: Exportação de dados em formato CSV
- **HTML**: Geração de HTML com CSS responsivo

### ✅ Opções Configuráveis
- **Incluir Renda Fixa**: Toggle para incluir/excluir dados de renda fixa
- **Qualidade**: Seleção de qualidade (Baixa, Média, Alta)
- **Nome do Arquivo**: Geração automática com timestamp

### ✅ Interface Interativa
- **Botões de Ação**: Interface intuitiva para gerar arquivos
- **Logs em Tempo Real**: Acompanhamento das operações
- **Feedback Visual**: Indicadores de sucesso/erro
- **Loading States**: Estados de carregamento

## 🛠️ Como Usar

### 1. Acessar o Demo
```typescript
// Rota: /extrato-generator-demo
import { EXTRATO_GENERATOR_DEMO_ROUTES } from './extrato-generator-demo.routes';
```

### 2. Configurar Dados
```typescript
const extratoData: ExtratoSimples = {
  itens: [
    { data: '2024-09-01', descricao: 'Depósito', valor: 1000, saldo: 1000 },
    { data: '2024-09-02', descricao: 'Saque', valor: -100, saldo: 900 }
  ]
};
```

### 3. Configurar Opções
```typescript
const options: GeracaoOptions = {
  includeRendaFixa: true,
  quality: 'high',
  fileName: 'extrato-customizado.pdf'
};
```

### 4. Gerar Arquivos
```typescript
// PDF
await this.extratoGenerator.gerarPDF(extratoData, config, options);

// CSV
await this.extratoGenerator.gerarCSV(extratoData, config, options);

// HTML
await this.extratoGenerator.gerarHTML(extratoData, config, options);
```

## 📊 Dados de Exemplo

O demo utiliza dados mockados que incluem:

### Extrato Simples
- **5 transações** de exemplo
- **Depósitos e saques**
- **Transferências**
- **Pagamentos PIX**

### Renda Fixa (Opcional)
- **Saldo Anterior**
- **Aplicações**
- **Resgates**
- **Saldo Final**

## 🎨 Interface

### Seções do Demo
1. **📊 Dados do Extrato**: Visualização dos dados
2. **⚙️ Opções de Geração**: Configurações
3. **🎯 Ações**: Botões para gerar arquivos
4. **✅ Resultado**: Feedback das operações
5. **📋 Log de Atividades**: Histórico em tempo real

### Estilos
- **Design Responsivo**: Adaptável a diferentes telas
- **Cores Temáticas**: Código de cores para diferentes ações
- **Animações**: Loading spinner e transições suaves
- **Feedback Visual**: Estados de sucesso/erro claros

## 🔧 Configuração Técnica

### Dependências
```typescript
// Serviços
ExtratoGeneratorService
WebViewDownloadService

// Bibliotecas
jsPDF
html2canvas

// Mocks
RENDA_FIXA_DATA
```

### Estrutura de Arquivos
```
src/app/features/extrato/services/
├── extrato-generator.service.ts          # Serviço principal
├── extrato-generator.service.spec.ts     # Testes unitários
├── extrato-generator.example.ts          # Exemplos de uso
├── extrato-generator-demo.component.ts   # Componente demo
├── extrato-generator-demo.routes.ts      # Rotas do demo
└── README-DEMO.md                        # Esta documentação
```

## 📈 Métricas de Qualidade

### Testes
- **28 testes** passando
- **94.48%** cobertura de statements
- **74.6%** cobertura de branches
- **100%** cobertura de funções
- **95.03%** cobertura de linhas

### Performance
- **Geração rápida** de arquivos
- **Tratamento de erros** robusto
- **Interface responsiva**
- **Logs em tempo real**

## 🚀 Próximos Passos

1. **Integração**: Usar o serviço em componentes reais
2. **Customização**: Adaptar para necessidades específicas
3. **Extensão**: Adicionar novos formatos de exportação
4. **Otimização**: Melhorar performance para grandes volumes

## 📞 Suporte

Para dúvidas ou sugestões sobre o demo:
- Verificar logs de erro no console
- Consultar a documentação do serviço
- Revisar os testes unitários
- Analisar os exemplos de uso
