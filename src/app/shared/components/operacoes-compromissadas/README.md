# Operações Compromissadas Component

Componente Angular para exibição de operações compromissadas com funcionalidades de ordenação, paginação e ocultação de valores.

## 📋 Funcionalidades

- ✅ **Tabela responsiva** com dados de certificados compromissados
- ✅ **Ordenação por colunas** (Certificado, Data de Emissão, Valores)
- ✅ **Paginação** com navegação anterior/próxima
- ✅ **Ocultação de valores** para privacidade
- ✅ **Formatação monetária** brasileira (BRL)
- ✅ **Resumo de valores** (bruto e líquido)
- ✅ **Design responsivo** para mobile e desktop

## 🎯 Interface

```typescript
interface CertificadoCompromissadas {
  custodia: string;                    // Número do certificado
  dataEmissao: string;                 // Data de emissão (DD/MM/YYYY)
  valorInicialAplicado: number;        // Valor principal aplicado
  valorContabil: number;               // Valor bruto
  valorPosicaoLiquida: number;         // Valor líquido
}
```

## 📦 Inputs

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `certificados` | `CertificadoCompromissadas[]` | Array de certificados |
| `valorBrutoTotal` | `number` | Valor bruto total |
| `valorLiquidoTotal` | `number` | Valor líquido total |
| `totalItens` | `number` | Total de itens para paginação |
| `paginaAtual` | `number` | Página atual (default: 1) |
| `itensPorPagina` | `number` | Itens por página (default: 15) |

## 📤 Outputs

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `ordenar` | `{ coluna: ColunaOrdenacao; direcao: DirecaoOrdenacao }` | Emitido ao ordenar coluna |
| `mudarPagina` | `number` | Emitido ao mudar página |
| `ocultarValores` | `void` | Emitido ao ocultar/mostrar valores |

## 🚀 Uso Básico

```typescript
import { OperacoesCompromissadasComponent } from './operacoes-compromissadas.component';

@Component({
  template: `
    <app-operacoes-compromissadas
      [certificados]="certificados"
      [valorBrutoTotal]="valorBrutoTotal"
      [valorLiquidoTotal]="valorLiquidoTotal"
      [totalItens]="totalItens"
      (ordenar)="onOrdenar($event)"
      (mudarPagina)="onMudarPagina($event)"
      (ocultarValores)="onOcultarValores()">
    </app-operacoes-compromissadas>
  `
})
export class MeuComponente {
  certificados: CertificadoCompromissadas[] = [
    {
      custodia: '1405190840',
      dataEmissao: '18/08/2024',
      valorInicialAplicado: 175997.84,
      valorContabil: 21078.57,
      valorPosicaoLiquida: 21778.0
    }
    // ... mais certificados
  ];

  valorBrutoTotal = 97100997.86;
  valorLiquidoTotal = 97098310.64;
  totalItens = 14;

  onOrdenar(event: { coluna: ColunaOrdenacao; direcao: DirecaoOrdenacao }) {
    // Implementar lógica de ordenação
    console.log('Ordenar:', event);
  }

  onMudarPagina(pagina: number) {
    // Implementar lógica de paginação
    console.log('Mudar página:', pagina);
  }

  onOcultarValores() {
    // Lógica para ocultar/mostrar valores
    console.log('Alternar visibilidade');
  }
}
```

## 🎨 Estilos

O componente inclui estilos completos com:

- **Design System** consistente
- **Estados de hover** e interação
- **Indicadores de ordenação** visuais
- **Responsividade** para mobile
- **Acessibilidade** com foco e navegação

## 🔧 Colunas Ordenáveis

| Coluna | Chave | Tipo |
|--------|-------|------|
| Certificado | `custodia` | string |
| Data de Emissão | `dataEmissao` | string |
| Valor Principal | `valorInicialAplicado` | number |
| Valor Bruto | `valorContabil` | number |
| Valor Líquido | `valorPosicaoLiquida` | number |

## 📱 Responsividade

- **Desktop**: Layout completo com todas as colunas visíveis
- **Tablet**: Tabela com scroll horizontal se necessário
- **Mobile**: Layout adaptado com paginação centralizada

## 🎯 Funcionalidades Implementadas

### ✅ Ordenação
```typescript
onOrdenar(coluna: ColunaOrdenacao, itens: CertificadoCompromissadas[]): void {
  // Implementa ordenação local ou emite evento para backend
  // Alterna entre 'asc' e 'desc'
  // Atualiza indicadores visuais
}
```

### ✅ Paginação
```typescript
// Navegação anterior/próxima
proximaPagina(): void
paginaAnterior(): void

// Verificação de estado
podeProximaPagina(): boolean
podePaginaAnterior(): boolean
```

### ✅ Formatação
```typescript
formatarValor(valor: number): string {
  // Formatação BRL com ocultação opcional
  // Ex: "R$ 175.997,84" ou "••••••••"
}
```

## 🔍 Exemplo Completo

Veja `operacoes-compromissadas-example.component.ts` para um exemplo completo de implementação com dados de exemplo baseados na imagem fornecida.

## 📋 Requisitos

- Angular 17+
- FontAwesome para ícones (opcional)
- CommonModule

## 🚀 Instalação

```bash
# Copiar arquivos do componente
cp -r operacoes-compromissadas/ src/app/shared/components/

# Importar no módulo ou usar como standalone
import { OperacoesCompromissadasComponent } from './operacoes-compromissadas.component';
```

## 🎨 Customização

O componente pode ser customizado através de:

1. **CSS Variables** para cores e espaçamentos
2. **Inputs** para configuração de comportamento
3. **Slots** para conteúdo customizado (futuro)
4. **Temas** através de classes CSS

## 📊 Performance

- **TrackBy function** para otimizar re-renderização
- **OnPush** change detection (recomendado)
- **Lazy loading** para grandes datasets
- **Virtual scrolling** (futuro)
