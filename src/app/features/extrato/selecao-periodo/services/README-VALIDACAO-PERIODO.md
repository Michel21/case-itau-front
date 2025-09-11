# ValidacaoPeriodoService

Serviço de validação de período independente que pode ser usado sem FormBuilder e em qualquer lifecycle hook.

## Características

- ✅ **Independente do FormBuilder**: Funciona sem Reactive Forms
- ✅ **Lifecycle Agnostic**: Pode ser usado em ngOnInit, AfterViewInit, etc.
- ✅ **Validações Reativas**: Usa Angular Signals para reatividade
- ✅ **Interface Limpa**: Métodos simples e intuitivos
- ✅ **SOLID Principles**: Segue princípios de design limpo
- ✅ **TypeScript**: Totalmente tipado

## Instalação

```typescript
import { ValidacaoPeriodoService } from './services/validacao-periodo.service';

@Component({...})
export class MeuComponente {
  private readonly validacao = inject(ValidacaoPeriodoService);
}
```

## Uso Básico

### 1. Definir Tipo de Seleção

```typescript
// Por mês
this.validacao.definirTipoSelecao('mes');

// Por intervalo
this.validacao.definirTipoSelecao('intervalo');
```

### 2. Definir Valores

```typescript
// Valores individuais
this.validacao.definirMes('03');
this.validacao.definirAno('2024');
this.validacao.definirDataInicio('2024-01-01');
this.validacao.definirDataFim('2024-01-31');

// Valores em lote
this.validacao.definirValores({
  tipoSelecao: 'intervalo',
  dataInicio: '2024-01-01',
  dataFim: '2024-01-31'
});
```

### 3. Verificar Validação

```typescript
// Verificar se é válido
const valido = !this.validacao.formularioInvalido();

// Obter mensagem de erro
const erro = this.validacao.mensagemErro();

// Obter estado completo
const estado = this.validacao.obterEstado();
```

## Uso em Lifecycle Hooks

### ngOnInit

```typescript
ngOnInit(): void {
  // Inicializar valores padrão
  this.validacao.definirTipoSelecao('mes');
  this.validacao.definirMes('01');
  this.validacao.definirAno('2024');
}
```

### AfterViewInit

```typescript
ngAfterViewInit(): void {
  // Validações que dependem do DOM
  this.validarElementosDOM();
}
```

### ngOnDestroy

```typescript
ngOnDestroy(): void {
  // Cleanup automático com signals - não necessário
}
```

## Validações Disponíveis

### Validação de Formulário

```typescript
// Verificar se formulário está válido
const valido = !this.validacao.formularioInvalido();

// Verificar se tem erros
const temErros = this.validacao.temErros();

// Obter mensagem de erro
const erro = this.validacao.mensagemErro();
```

### Validação de Intervalo

```typescript
// Verificar se intervalo é válido
const intervaloValido = !this.validacao.intervaloInvalido();

// Validar datas específicas
const dataValida = this.validacao.validarData('2024-01-01');
```

### Validação de Mês

```typescript
// Verificar se mês é válido
const mesValido = !this.validacao.mesInvalido();

// Validar campo específico
const campoValido = this.validacao.validarCampo('mes');
```

## Formatação

### Período Formatado

```typescript
// Obter período formatado
const periodo = this.validacao.periodoFormatado();
// Resultado: "Janeiro/2024" ou "01/01/2024 - 31/01/2024"
```

### Datas de Constraint

```typescript
// Obter datas mínimas e máximas
const dataMinima = this.validacao.obterDataMinima();
const dataMaxima = this.validacao.obterDataMaxima();
const dataMinimaInicio = this.validacao.obterDataMinimaInicio();
const dataMaximaInicio = this.validacao.obterDataMaximaInicio();
const dataMinimaFim = this.validacao.obterDataMinimaFim();
const dataMaximaFim = this.validacao.obterDataMaximaFim();
```

## Signals Reativos

O serviço usa Angular Signals para reatividade automática:

```typescript
// Signals de estado
this.validacao.tipoSelecao()        // 'mes' | 'intervalo'
this.validacao.mesSelecionado()     // string
this.validacao.anoSelecionado()     // string
this.validacao.dataInicio()         // string
this.validacao.dataFim()            // string

// Signals de validação
this.validacao.intervaloInvalido()  // boolean
this.validacao.mesInvalido()        // boolean
this.validacao.formularioInvalido() // boolean
this.validacao.temErros()           // boolean
this.validacao.mensagemErro()       // string

// Signals de formatação
this.validacao.periodoFormatado()   // string
```

## Exemplo Completo

```typescript
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { ValidacaoPeriodoService } from './services/validacao-periodo.service';

@Component({
  selector: 'app-meu-componente',
  template: `
    <div>
      <select (change)="validacao.definirTipoSelecao($event.target.value)">
        <option value="mes">Por Mês</option>
        <option value="intervalo">Por Intervalo</option>
      </select>
      
      @if (validacao.tipoSelecao() === 'mes') {
        <input 
          type="month" 
          [value]="validacao.mesSelecionado() + '-' + validacao.anoSelecionado()"
          (change)="onMesChange($event)">
      }
      
      @if (validacao.tipoSelecao() === 'intervalo') {
        <input 
          type="date" 
          [value]="validacao.dataInicio()"
          (change)="validacao.definirDataInicio($event.target.value)">
        <input 
          type="date" 
          [value]="validacao.dataFim()"
          (change)="validacao.definirDataFim($event.target.value)">
      }
      
      <button 
        [disabled]="validacao.formularioInvalido()"
        (click)="aplicarFiltro()">
        Aplicar
      </button>
      
      @if (validacao.temErros()) {
        <div class="erro">{{ validacao.mensagemErro() }}</div>
      }
    </div>
  `
})
export class MeuComponente implements OnInit, AfterViewInit {
  private readonly validacao = inject(ValidacaoPeriodoService);

  ngOnInit(): void {
    this.validacao.definirTipoSelecao('mes');
  }

  ngAfterViewInit(): void {
    // Validações que dependem do DOM
  }

  onMesChange(event: any): void {
    const [ano, mes] = event.target.value.split('-');
    this.validacao.definirAno(ano);
    this.validacao.definirMes(mes);
  }

  aplicarFiltro(): void {
    if (this.validacao.formularioInvalido()) return;
    
    const estado = this.validacao.obterEstado();
    console.log('Aplicando filtro:', estado);
  }
}
```

## Vantagens

1. **Simplicidade**: Interface limpa e intuitiva
2. **Flexibilidade**: Funciona em qualquer lifecycle hook
3. **Reatividade**: Atualizações automáticas com signals
4. **Independência**: Não depende de FormBuilder
5. **Tipagem**: Totalmente tipado com TypeScript
6. **Testabilidade**: Fácil de testar unitariamente
7. **Manutenibilidade**: Código limpo e bem estruturado

## Casos de Uso

- ✅ Componentes sem FormBuilder
- ✅ Validações em ngOnInit/AfterViewInit
- ✅ Validações em tempo real
- ✅ Integração com APIs externas
- ✅ Validações customizadas
- ✅ Testes unitários
- ✅ Componentes reutilizáveis
