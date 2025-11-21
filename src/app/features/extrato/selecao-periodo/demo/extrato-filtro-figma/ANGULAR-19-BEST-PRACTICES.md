# 🚀 Angular 19 - Melhores Práticas Aplicadas

## 📋 Índice

- [Features do Angular 19](#features-do-angular-19)
- [Melhores Práticas](#melhores-práticas)
- [Acessibilidade](#acessibilidade)
- [Performance](#performance)
- [Type Safety](#type-safety)

---

## ✨ Features do Angular 19

### 1. **Signals Avançados**

#### `computed()` Signals
```typescript
// ✅ Valor derivado reativo
readonly filtroHabilitado = computed(() => 
  this.formularioValido() && this.tipoPeriodo() === 'mes'
);

// ✅ Mensagem dinâmica com lógica complexa
readonly mensagemStatus = computed(() => {
  const tipo = this.tipoPeriodo();
  
  if (tipo === 'intervalo') {
    return 'Seleção por intervalo não implementada nesta demonstração.';
  }

  const valido = this.filtroHabilitado();
  if (valido) {
    const mes = this.obterNomeMes(this.mesSelecionado());
    const ano = this.anoSelecionado();
    return `✅ Período válido: ${mes} de ${ano}. Clique em Aplicar filtro.`;
  }

  return 'Informe mês e ano para habilitar o botão Aplicar filtro.';
});

// ✅ Estado completo do formulário
readonly estadoFiltro = computed((): EstadoFiltro => ({
  tipoPeriodo: this.tipoPeriodo(),
  mes: this.mesSelecionado(),
  ano: this.anoSelecionado(),
  valido: this.filtroHabilitado()
}));
```

#### `toSignal()` - Conversão de Observables
```typescript
// ✅ Converter Observable do formulário para Signal
readonly tipoPeriodo = toSignal(
  this.filtroForm.get('tipoPeriodo')!.valueChanges.pipe(
    startWith(this.filtroForm.get('tipoPeriodo')!.value),
    distinctUntilChanged(),
    map((value): TipoPeriodo => value ?? 'mes')
  ),
  { initialValue: 'mes' as TipoPeriodo }
);

// ✅ Signal de validade do formulário
readonly formularioValido = toSignal(
  this.filtroForm.statusChanges.pipe(
    startWith(this.filtroForm.status),
    map(status => status === 'VALID'),
    distinctUntilChanged()
  ),
  { initialValue: false }
);
```

#### `viewChild()` Signals
```typescript
// ✅ Referência ao elemento do DOM como Signal
readonly campoMes = viewChild<ElementRef<HTMLSelectElement>>('campoMes');
readonly campoAno = viewChild<ElementRef<HTMLInputElement>>('campoAno');

// Uso no template
<select #campoMes ...>
<input #campoAno ...>
```

### 2. **Effects**

```typescript
constructor() {
  // Effect: Log mudanças de estado (apenas em dev)
  effect(() => {
    if (!this.isProduction()) {
      console.log('📊 Estado do filtro:', this.estadoFiltro());
    }
  });

  // Effect: Resetar campos quando mudar tipo de período
  effect(() => {
    const tipo = this.tipoPeriodo();
    
    if (tipo === 'intervalo') {
      this.filtroForm.patchValue({ mes: '', ano: '' }, { emitEvent: false });
    }
  });

  // Effect: Focar no campo seguinte automaticamente
  effect(() => {
    const tipo = this.tipoPeriodo();
    const mes = this.mesSelecionado();
    
    if (tipo === 'mes' && mes && !this.anoSelecionado()) {
      const campoAnoEl = this.campoAno();
      if (campoAnoEl) {
        queueMicrotask(() => campoAnoEl.nativeElement.focus());
      }
    }
  });
}
```

### 3. **Control Flow Syntax**

#### `@if` - Condicional
```html
<!-- ✅ Nova sintaxe do Angular 19 -->
@if (tipoPeriodo() === 'mes') {
  <section class="form-section">
    <!-- Campos de formulário -->
  </section>
} @else {
  <p class="segment-control__info" role="status">
    Seleção por intervalo não implementada nesta demonstração.
  </p>
}
```

#### `@for` - Loop
```html
<!-- ✅ Nova sintaxe com track obrigatório -->
@for (mes of meses; track mes.value) {
  <option [value]="mes.value">{{ mes.label }}</option>
}
```

#### `@if` com `as` - Alias
```html
<!-- ✅ Criar alias para valores truthy -->
@if (getMensagemErro('mes'); as erro) {
  <span id="erro-mes" role="alert" class="form-field__error">
    {{ erro }}
  </span>
}
```

### 4. **Inject Function**

```typescript
// ✅ Injeção de dependências com `inject()`
private readonly fb = inject(FormBuilder);

// ❌ Modo antigo (ainda funciona mas não é recomendado)
constructor(private fb: FormBuilder) {}
```

### 5. **Host Bindings**

```typescript
@Component({
  // ...
  host: {
    '[class.filtro-container]': 'true',
    '[attr.data-theme]': 'tema()'
  }
})
```

---

## 🎯 Melhores Práticas

### 1. **Type Safety Completa**

```typescript
// ✅ Tipos explícitos
type TipoPeriodo = 'intervalo' | 'mes';

interface EstadoFiltro {
  readonly tipoPeriodo: TipoPeriodo;
  readonly mes: string;
  readonly ano: string;
  readonly valido: boolean;
}

// ✅ Readonly para imutabilidade
interface OpcaoSelect {
  readonly value: string;
  readonly label: string;
}

// ✅ Const assertion
const MESES: readonly OpcaoSelect[] = [...] as const;
```

### 2. **Constantes Extraídas**

```typescript
// ✅ Constantes no topo do arquivo
const MESES: readonly OpcaoSelect[] = [...] as const;
const ANOS_HISTORICO = 6;
const REGEX_ANO = /^\d{4}$/;

// ❌ Magic numbers no código
validators: [Validators.pattern(/^\d{4}$/)]

// ✅ Usar constantes
validators: [Validators.pattern(REGEX_ANO)]
```

### 3. **ChangeDetection OnPush**

```typescript
@Component({
  // ✅ OnPush para melhor performance
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 4. **Readonly Signals**

```typescript
// ✅ Todos os signals são readonly
readonly tipoPeriodo = toSignal(...);
readonly formularioValido = toSignal(...);
readonly filtroHabilitado = computed(...);
```

### 5. **Documentação JSDoc**

```typescript
/**
 * Aplica o filtro selecionado
 * Emite evento e mostra mensagem de sucesso
 */
aplicarFiltro(): void {
  // ...
}

/**
 * Retorna a mensagem de erro para um campo específico
 * @param controlName - Nome do campo
 * @returns Mensagem de erro ou null
 */
getMensagemErro(controlName: 'mes' | 'ano'): string | null {
  // ...
}
```

### 6. **Organização de Código**

```typescript
export class ExtratoFiltroFigmaComponent {
  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  // ============================================================================
  // VIEW CHILDREN SIGNALS
  // ============================================================================
  
  // ============================================================================
  // CONSTANTES PÚBLICAS
  // ============================================================================
  
  // ============================================================================
  // FORMULÁRIO REATIVO
  // ============================================================================
  
  // ============================================================================
  // SIGNALS COMPUTED
  // ============================================================================
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================
  
  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================
}
```

---

## ♿ Acessibilidade (WCAG AA)

### 1. **ARIA Labels e Roles**

```html
<!-- ✅ Roles semânticos -->
<header role="banner" aria-label="Cabeçalho da seleção de extrato">
<main role="main" aria-labelledby="titulo-investimentos">

<!-- ✅ ARIA labels descritivos -->
<button aria-label="Voltar para a tela anterior">
<fieldset role="radiogroup" aria-label="Seleção de tipo de período">

<!-- ✅ ARIA relationships -->
<input 
  [attr.aria-invalid]="!!getMensagemErro('mes')"
  [attr.aria-describedby]="getMensagemErro('mes') ? 'erro-mes' : null"
/>
```

### 2. **Live Regions**

```html
<!-- ✅ Região invisível para anúncios -->
<div 
  id="status-message" 
  class="visually-hidden" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true">
</div>

<!-- ✅ Mensagens dinâmicas -->
<div class="status-message" role="status" aria-live="polite" aria-atomic="true">
  {{ mensagemStatus() }}
</div>
```

### 3. **Mensagens de Erro Acessíveis**

```html
<!-- ✅ Erros anunciados para leitores de tela -->
@if (getMensagemErro('mes'); as erro) {
  <span id="erro-mes" role="alert" class="form-field__error">
    {{ erro }}
  </span>
}
```

### 4. **Visually Hidden**

```scss
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 5. **Anúncios Programáticos**

```typescript
/**
 * Anuncia mensagem para leitores de tela via aria-live
 * @param mensagem - Mensagem a ser anunciada
 */
private anunciarParaLeitoresDeTelaViaAria(mensagem: string): void {
  const liveRegion = document.getElementById('status-message');
  if (liveRegion) {
    liveRegion.textContent = mensagem;
  }
}

// Uso
aplicarFiltro(): void {
  // ...
  this.anunciarParaLeitoresDeTelaViaAria(
    `Filtro aplicado com sucesso para ${mes} de ${ano}`
  );
}
```

---

## ⚡ Performance

### 1. **OnPush Change Detection**
- Reduz verificações desnecessárias
- Apenas atualiza quando inputs mudam ou eventos ocorrem

### 2. **Computed Signals**
- Memoização automática
- Apenas recalcula quando dependências mudam
- Mais eficiente que getters

### 3. **toSignal() com distinctUntilChanged**
```typescript
// ✅ Evita emissões duplicadas
readonly tipoPeriodo = toSignal(
  this.filtroForm.get('tipoPeriodo')!.valueChanges.pipe(
    startWith(this.filtroForm.get('tipoPeriodo')!.value),
    distinctUntilChanged(), // ✅ Performance
    map((value): TipoPeriodo => value ?? 'mes')
  ),
  { initialValue: 'mes' as TipoPeriodo }
);
```

### 4. **Effects com queueMicrotask**
```typescript
// ✅ Evita ExpressionChangedAfterItHasBeenCheckedError
effect(() => {
  // ...
  if (campoAnoEl) {
    queueMicrotask(() => campoAnoEl.nativeElement.focus());
  }
});
```

### 5. **Track Function no @for**
```html
<!-- ✅ Otimiza re-renderização de listas -->
@for (mes of meses; track mes.value) {
  <option [value]="mes.value">{{ mes.label }}</option>
}
```

---

## 🔒 Type Safety

### 1. **Strict TypeScript**
```typescript
// ✅ Non-null assertions quando seguro
this.filtroForm.get('tipoPeriodo')!.valueChanges

// ✅ Optional chaining
const campoAnoEl = this.campoAno();
if (campoAnoEl) {
  campoAnoEl.nativeElement.focus();
}
```

### 2. **Union Types**
```typescript
type TipoPeriodo = 'intervalo' | 'mes';

// ✅ Type guard no template
@if (tipoPeriodo() === 'mes') { }
```

### 3. **Readonly Interfaces**
```typescript
interface EstadoFiltro {
  readonly tipoPeriodo: TipoPeriodo;
  readonly mes: string;
  readonly ano: string;
  readonly valido: boolean;
}
```

### 4. **Const Assertions**
```typescript
const MESES: readonly OpcaoSelect[] = [
  { value: '01', label: 'Janeiro' },
  // ...
] as const;
```

---

## 📊 Comparação: Antes vs Depois

### Antes (Angular 18 ou anterior)

```typescript
// ❌ Constructor injection
constructor(private fb: FormBuilder) {}

// ❌ Computed manual com getter
get filtroHabilitado(): boolean {
  return this.filtroForm.valid && this.tipoPeriodo === 'mes';
}

// ❌ Sem type safety
tipoPeriodo: any;

// ❌ Sem signals
mensagemStatus = 'Informe...';

// ❌ ngIf/ngFor no template
<div *ngIf="tipoPeriodo === 'mes'">
  <option *ngFor="let mes of meses">
```

### Depois (Angular 19)

```typescript
// ✅ inject() function
private readonly fb = inject(FormBuilder);

// ✅ Computed signal com memoização
readonly filtroHabilitado = computed(() => 
  this.formularioValido() && this.tipoPeriodo() === 'mes'
);

// ✅ Type safety completo
type TipoPeriodo = 'intervalo' | 'mes';

// ✅ Signals reativos
readonly mensagemStatus = computed(() => { /* ... */ });

// ✅ Control flow syntax
@if (tipoPeriodo() === 'mes') {
  @for (mes of meses; track mes.value) {
```

---

## ✅ Checklist de Boas Práticas

- [x] ✅ Signals para estado reativo
- [x] ✅ `computed()` para valores derivados
- [x] ✅ `effect()` para side effects
- [x] ✅ `toSignal()` para Observables
- [x] ✅ `viewChild()` para referências DOM
- [x] ✅ Control Flow syntax (`@if`, `@for`)
- [x] ✅ `inject()` para dependências
- [x] ✅ ChangeDetection OnPush
- [x] ✅ Type safety completa
- [x] ✅ Readonly signals e interfaces
- [x] ✅ Const assertions
- [x] ✅ JSDoc documentation
- [x] ✅ Acessibilidade WCAG AA
- [x] ✅ ARIA labels e roles
- [x] ✅ Live regions
- [x] ✅ Mensagens de erro acessíveis
- [x] ✅ Track functions em loops
- [x] ✅ distinctUntilChanged para performance
- [x] ✅ queueMicrotask para evitar errors
- [x] ✅ Organização de código clara
- [x] ✅ Standalone components
- [x] ✅ Host bindings

---

## 🎓 Recursos Adicionais

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Control Flow Syntax](https://angular.dev/guide/templates/control-flow)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última atualização:** 2025-01-09  
**Angular Version:** 19.2  
**Status:** ✅ Implementado e documentado

