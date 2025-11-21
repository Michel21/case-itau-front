# 🚀 Migração para Angular 19

## ✅ Componentes Refatorados

Os componentes **Tabela** e **Checkbox** foram refatorados para aproveitar as novas features do Angular 19.

---

## 📊 Componente Tabela

### Mudanças Principais

#### 1. **Input/Output Signals** (Angular 17+)

**Antes:**
```typescript
@Input() mostrarHeader = true;
@Input() caption: string;
@Output() buscaOnChange = new EventEmitter<string>();
```

**Depois:**
```typescript
readonly mostrarHeader = input<boolean>(true);
readonly caption = input<string>();
readonly buscaOnChange = output<string>();
```

#### 2. **State Signals** (Angular 16+)

**Antes:**
```typescript
buscaKeyword = '';
currentPage = 1;
sortClassColumn: Array<string> = [];
```

**Depois:**
```typescript
readonly buscaKeyword = signal('');
readonly currentPage = signal(1);
readonly sortClassColumn = signal<Array<string>>([]);
```

#### 3. **Computed Signals**

```typescript
readonly itensProcessados = computed(() => {
    let items = [...this.itens()];
    
    if (this.temExpansivel()) {
        items = items.map((a, i) => ({
            ...a,
            _internalID: i,
            expande: a.expande ?? false,
            // ...
        }));
    }

    return items;
});
```

#### 4. **ViewChild/ContentChild Signals** (Angular 17.3+)

**Antes:**
```typescript
@ViewChild('inputBusca', { static: false }) inputBusca!: ElementRef;
@ContentChildren('header') headers!: QueryList<TemplateRef<any>>;
```

**Depois:**
```typescript
readonly inputBusca = viewChild<ElementRef>('inputBusca');
readonly headers = contentChildren<TemplateRef<any>>('header', { descendants: false });
```

#### 5. **Nova Sintaxe de Control Flow** (Angular 17+)

**Antes:**
```html
<div *ngIf="buscaMostrarCampo">...</div>
<tr *ngFor="let linha of itens; let i = index">...</tr>
```

**Depois:**
```html
@if (buscaMostrarCampo()) {
    <div>...</div>
}
@for (linha of itens(); track $index) {
    <tr>...</tr>
}
```

#### 6. **Effects**

```typescript
constructor() {
    effect(() => {
        const items = this.itens();
        if (items && items.length > 0) {
            this.sortClassColumn.set(
                Array(Object.keys(items[0]).length).fill('tabela-sort-headerUnSorted')
            );
        }
    });
}
```

---

## ☑️ Componente Checkbox

### Mudanças Principais

#### 1. **Input/Output Signals**

**Antes:**
```typescript
@Input() disabled = false;
@Input() titulo: string;
@Output() valueChange = new EventEmitter<boolean>();
```

**Depois:**
```typescript
readonly disabled = input<boolean>(false);
readonly titulo = input<string>();
readonly valueChange = output<boolean | undefined>();
```

#### 2. **State Signals**

**Antes:**
```typescript
value: boolean | undefined = false;
```

**Depois:**
```typescript
readonly value = signal<boolean | undefined>(false);
readonly ariaChecked = signal<string | boolean>('false');
```

#### 3. **Effects para Computed Values**

```typescript
constructor() {
    effect(() => {
        const val = this.value();
        this.ariaChecked.set(val === undefined ? 'mixed' : val);
    });
}
```

#### 4. **Signal Updates**

**Antes:**
```typescript
this.value = !this.value;
```

**Depois:**
```typescript
this.value.update(val => !val);
// ou
this.value.set(true);
```

---

## 🔄 Componente Paginação

### Mudanças Principais

#### 1. **Input/Output Signals**

```typescript
readonly totalItems = input<number>(0);
readonly currentPage = input<number>(1);
readonly changePage = output<any>();
```

#### 2. **Computed Signals**

```typescript
readonly totalPages = computed(() => 
    Math.ceil(this.totalItems() / this.pageSize())
);

readonly paginationConfig = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    // ... cálculos
    return { startPage, endPage, totalPages };
});
```

#### 3. **Effects para Auto-atualização**

```typescript
constructor() {
    effect(() => {
        this.refreshComponent(this.currentPage());
    });
}
```

---

## 🎯 Benefícios da Refatoração

### Performance
- ✅ **Change Detection Otimizada**: Signals permitem mudanças mais granulares
- ✅ **Computed Values**: Cálculos memoizados automaticamente
- ✅ **OnPush-ready**: Signals são compatíveis com OnPush strategy

### Tipo-segurança
- ✅ **Type Safety Melhorada**: Input/output signals são fortemente tipados
- ✅ **Autocompletar Aprimorado**: IDE reconhece melhor os tipos
- ✅ **Menos Erros em Runtime**: Erros detectados em tempo de compilação

### Developer Experience
- ✅ **Menos Boilerplate**: Menos decorators, código mais limpo
- ✅ **Reatividade Explícita**: Signals deixam claro o que é reativo
- ✅ **Template Syntax Moderna**: @if/@for é mais legível que *ngIf/*ngFor

### Manutenibilidade
- ✅ **Código Mais Declarativo**: Intenções mais claras
- ✅ **State Management Simplificado**: Signals centralizam o estado
- ✅ **Efeitos Colaterais Controlados**: Effects são explícitos

---

## 📝 Guia de Migração

### 1. Inputs

```typescript
// Antes
@Input() propriedade: tipo = valor;

// Depois
readonly propriedade = input<tipo>(valor);
```

### 2. Outputs

```typescript
// Antes
@Output() evento = new EventEmitter<tipo>();
evento.emit(valor);

// Depois
readonly evento = output<tipo>();
evento.emit(valor);
```

### 3. State

```typescript
// Antes
propriedade: tipo = valor;
this.propriedade = novoValor;

// Depois
readonly propriedade = signal<tipo>(valor);
this.propriedade.set(novoValor);
// ou
this.propriedade.update(val => transformacao(val));
```

### 4. Computed

```typescript
// Antes
get propriedadeComputada() {
    return this.prop1 + this.prop2;
}

// Depois
readonly propriedadeComputada = computed(() => 
    this.prop1() + this.prop2()
);
```

### 5. ViewChild/ContentChild

```typescript
// Antes
@ViewChild('ref') elemento!: ElementRef;

// Depois
readonly elemento = viewChild<ElementRef>('ref');
```

### 6. Control Flow no Template

```typescript
// @if
@if (condicao()) {
    <div>...</div>
} @else if (outraCondicao()) {
    <div>...</div>
} @else {
    <div>...</div>
}

// @for
@for (item of items(); track item.id) {
    <div>{{item.nome}}</div>
} @empty {
    <div>Nenhum item</div>
}

// @switch
@switch (valor()) {
    @case (1) { <div>Um</div> }
    @case (2) { <div>Dois</div> }
    @default { <div>Outro</div> }
}
```

---

## 🔗 Compatibilidade

- ✅ **Backward Compatible**: Funciona com código legado
- ✅ **Forms Integration**: ControlValueAccessor ainda funciona
- ✅ **Reactive Forms**: Totalmente compatível
- ✅ **Template-driven Forms**: Suporte completo

---

## 📚 Recursos Adicionais

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [New Control Flow Syntax](https://angular.dev/guide/templates/control-flow)
- [Input/Output Signals](https://angular.dev/guide/signals/inputs)
- [Angular 19 Release Notes](https://github.com/angular/angular/releases)

---

## ✅ Checklist de Migração

- [x] Converter @Input para input()
- [x] Converter @Output para output()
- [x] Converter properties para signals
- [x] Criar computed signals
- [x] Adicionar effects onde necessário
- [x] Atualizar ViewChild/ContentChild
- [x] Migrar templates para nova sintaxe
- [x] Verificar tipos TypeScript
- [x] Testar funcionalidades
- [x] Atualizar documentação

---

**Data da migração:** 2025-01-09  
**Angular version target:** 19+  
**Status:** ✅ Completo



