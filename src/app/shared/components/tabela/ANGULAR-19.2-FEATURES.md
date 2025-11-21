# 🚀 Tabela Component - Angular 19.2

## ✨ Recursos do Angular 19.2

Este componente foi completamente refatorado para aproveitar os recursos mais modernos do Angular 19.2.

---

## 📋 Signals API

### Input Signals

Os inputs agora usam a **input()** function, que oferece:
- ✅ Type safety aprimorado
- ✅ Readonly by default
- ✅ Melhor integração com computed signals
- ✅ Change detection otimizada

```typescript
// Definição
readonly mostrarHeader = input<boolean>(true);
readonly itens = input<Array<any>>([]);
readonly caption = input<string>();

// Uso no template
@if (mostrarHeader()) {
    <thead>...</thead>
}

// Uso no componente
const items = this.itens();
const hasCaption = !!this.caption();
```

### Output Signals

Os outputs agora usam a **output()** function:

```typescript
// Definição
readonly buscaOnChange = output<string>();
readonly checkboxRowClick = output<any>();

// Emissão
this.buscaOnChange.emit(valor);
```

### State Signals

Estado interno gerenciado com signals:

```typescript
readonly currentPage = signal(1);
readonly sortClassColumn = signal<string[]>([]);
readonly checkHeader = signal<boolean | undefined>(false);

// Atualização
this.currentPage.set(2);
this.sortClassColumn.update(cols => [...cols, 'nova-classe']);
```

### Computed Signals

Valores derivados calculados automaticamente:

```typescript
readonly itensProcessados = computed(() => {
    let items = [...this.itens()];
    
    if (this.temExpansivel()) {
        items = items.map((a, i) => ({
            ...a,
            _internalID: i,
            expande: a.expande ?? false,
        }));
    }
    
    return items;
});

// Uso
const items = this.itensProcessados(); // Sempre atualizado!
```

---

## 🎯 ViewChild & ContentChild Signals

### ViewChild (Angular 17.3+)

```typescript
// Antes
@ViewChild('inputBusca', { static: false }) inputBusca!: ElementRef;

// Depois (Angular 19.2)
readonly inputBusca = viewChild<ElementRef>('inputBusca');

// Uso
const element = this.inputBusca();
if (element) {
    // elemento pode ser undefined
}
```

### ContentChildren (Angular 17.3+)

```typescript
// Antes
@ContentChildren('dados', { descendants: false }) 
colunas!: QueryList<TemplateRef<any>>;

// Depois (Angular 19.2)
readonly colunas = contentChildren<TemplateRef<any>>('dados', { 
    descendants: false 
});

// Uso
const templates = this.colunas(); // Signal<readonly TemplateRef[]>
```

---

## 🔄 Effects

Efeitos para reações automáticas:

```typescript
constructor() {
    effect(() => {
        const items = this.itens();
        
        if (items && items.length > 0) {
            // Este código roda automaticamente quando itens() muda
            this.sortClassColumn.set(
                Array(Object.keys(items[0]).length).fill('tabela-sort-headerUnSorted')
            );
        }
    });
}
```

### Effect com cleanup

```typescript
effect((onCleanup) => {
    const subscription = someObservable.subscribe(...);
    
    onCleanup(() => {
        subscription.unsubscribe();
    });
});
```

---

## 🎨 Nova Sintaxe de Control Flow

### @if / @else

```html
<!-- Antes -->
<div *ngIf="buscaMostrarCampo">
    <input>
</div>

<!-- Depois (Angular 19.2) -->
@if (buscaMostrarCampo()) {
    <div>
        <input>
    </div>
}

<!-- Com else -->
@if (itens().length > 0) {
    <table>...</table>
} @else {
    <p>Nenhum item encontrado</p>
}

<!-- Com else if -->
@if (loading()) {
    <loader></loader>
} @else if (error()) {
    <error></error>
} @else {
    <content></content>
}
```

### @for / @empty

```html
<!-- Antes -->
<tr *ngFor="let linha of itens; let i = index; trackBy: trackByFn">
    <td>{{linha.nome}}</td>
</tr>

<!-- Depois (Angular 19.2) -->
@for (linha of itens(); track linha.id) {
    <tr>
        <td>{{linha.nome}}</td>
    </tr>
} @empty {
    <tr>
        <td colspan="3">Nenhum registro encontrado</td>
    </tr>
}

<!-- Com $index -->
@for (linha of itens(); track $index) {
    <tr [class.par]="$index % 2 === 0">
        <td>{{linha.nome}}</td>
    </tr>
}
```

### @switch / @case

```html
@switch (status()) {
    @case ('ativo') {
        <span class="badge-success">Ativo</span>
    }
    @case ('inativo') {
        <span class="badge-danger">Inativo</span>
    }
    @default {
        <span class="badge-warning">Desconhecido</span>
    }
}
```

---

## 📊 Padrões de Uso

### Pattern 1: Lista com Signal

```typescript
// Component
readonly usuarios = signal([
    { id: 1, nome: 'João', email: 'joao@email.com' },
    { id: 2, nome: 'Maria', email: 'maria@email.com' }
]);

// Template
<app-tabela [itens]="usuarios()">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">
        {{ elemento.nome }}
    </ng-template>
</app-tabela>
```

### Pattern 2: Reactive com Computed

```typescript
// Component
readonly todosItens = signal([...]);
readonly filtro = signal('');

readonly itensFiltrados = computed(() => {
    const items = this.todosItens();
    const filter = this.filtro();
    
    if (!filter) return items;
    
    return items.filter(item => 
        item.nome.toLowerCase().includes(filter.toLowerCase())
    );
});

// Template
<app-tabela [itens]="itensFiltrados()">
    ...
</app-tabela>
```

### Pattern 3: Com Eventos

```typescript
// Component
readonly selectedItems = signal<any[]>([]);

onCheckboxClick(item: any): void {
    this.selectedItems.update(items => {
        if (item.check) {
            return [...items, item];
        } else {
            return items.filter(i => i.id !== item.id);
        }
    });
}

// Template
<app-tabela 
    [itens]="dados()"
    [temCheckbox]="true"
    (checkboxRowClick)="onCheckboxClick($event)">
    ...
</app-tabela>
```

---

## 🔧 Migração de Código Legado

### Input Properties

```typescript
// ANTES (Angular tradicional)
@Component({...})
export class MeuComponent {
    @Input() dados: Array<any> = [];
}

// Template
<app-tabela [itens]="dados"></app-tabela>

// DEPOIS (Angular 19.2)
@Component({...})
export class MeuComponent {
    readonly dados = signal<Array<any>>([]);
}

// Template
<app-tabela [itens]="dados()"></app-tabela>
```

### Event Handlers

```typescript
// ANTES
onSort(column: string) {
    this.sortColumn = column;
    this.loadData();
}

// DEPOIS (com signals)
readonly sortColumn = signal<string>('');

onSort(column: string): void {
    this.sortColumn.set(column);
    this.loadData();
}
```

---

## 🎯 Best Practices Angular 19.2

### 1. **Use Signals para Estado Reativo**

```typescript
// ✅ BOM
readonly loading = signal(false);
readonly data = signal<any[]>([]);

carregarDados() {
    this.loading.set(true);
    this.service.getData().subscribe(data => {
        this.data.set(data);
        this.loading.set(false);
    });
}

// ❌ EVITAR
loading = false;
data: any[] = [];
```

### 2. **Use Computed para Valores Derivados**

```typescript
// ✅ BOM
readonly total = computed(() => 
    this.itens().reduce((sum, item) => sum + item.valor, 0)
);

// ❌ EVITAR
get total() {
    return this.itens.reduce((sum, item) => sum + item.valor, 0);
}
```

### 3. **Use Effects para Side Effects**

```typescript
// ✅ BOM
constructor() {
    effect(() => {
        const search = this.searchTerm();
        console.log('Busca alterada:', search);
        this.logAnalytics('search', search);
    });
}

// ❌ EVITAR (em getters)
get searchTerm() {
    console.log('Getter chamado');
    return this._searchTerm;
}
```

### 4. **Use Track by ID no @for**

```html
<!-- ✅ BOM -->
@for (item of itens(); track item.id) {
    <tr>{{item.nome}}</tr>
}

<!-- ✅ ACEITÁVEL -->
@for (item of itens(); track $index) {
    <tr>{{item.nome}}</tr>
}

<!-- ❌ EVITAR (sem track) -->
<!-- Isso causará erro de compilação -->
```

### 5. **Imutabilidade com Signals**

```typescript
// ✅ BOM
this.itens.update(items => [...items, novoItem]);
this.itens.update(items => items.filter(i => i.id !== id));

// ❌ EVITAR (mutação direta)
this.itens().push(novoItem); // Não funcionará!
```

---

## 📚 APIs Utilizadas

| Feature | Versão | Status |
|---------|--------|--------|
| `input()` | Angular 17.1+ | ✅ Usado |
| `output()` | Angular 17.3+ | ✅ Usado |
| `signal()` | Angular 16+ | ✅ Usado |
| `computed()` | Angular 16+ | ✅ Usado |
| `effect()` | Angular 16+ | ✅ Usado |
| `viewChild()` | Angular 17.3+ | ✅ Usado |
| `contentChildren()` | Angular 17.3+ | ✅ Usado |
| `@if/@for/@switch` | Angular 17+ | ✅ Usado |
| Standalone Components | Angular 14+ | ✅ Disponível |

---

## 🔗 Compatibilidade

### Versões Suportadas
- ✅ Angular 19.2 (recomendado)
- ✅ Angular 19.x
- ✅ Angular 18.x (maioria das features)
- ✅ Angular 17.3+ (input/output signals)

### Modo de Uso
- ✅ **NgModule**: Use `TabelaModule`
- ✅ **Standalone**: Use `TabelaStandaloneImports`
- ✅ **Forms**: Totalmente compatível
- ✅ **Reactive Forms**: Totalmente compatível

---

## 🎯 Exemplo Completo Angular 19.2

```typescript
import { Component, signal, computed } from '@angular/core';
import { TabelaModule } from './shared/components/tabela';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    status: 'ativo' | 'inativo';
}

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [TabelaModule],
    template: `
        @if (loading()) {
            <p>Carregando...</p>
        } @else {
            <app-tabela 
                [itens]="usuariosFiltrados()"
                [temPaginacao]="true"
                [temCheckbox]="true"
                [buscaMostrarCampo]="true"
                [buscaAtivarBuscaEstatica]="true"
                [buscarNasPropriedades]="['nome', 'email']"
                caption="Gerenciamento de Usuários"
                (checkboxRowClick)="onSelecionar($event)"
                (buscaOnChange)="onBuscar($event)">
                
                <ng-template #botoesCaption>
                    <button (click)="exportar()">Exportar</button>
                    <button (click)="adicionar()">Novo</button>
                </ng-template>

                <ng-template sortBy="nome">Nome</ng-template>
                <ng-template #dados let-elemento="elemento">
                    {{ elemento.nome }}
                </ng-template>

                <ng-template sortBy="email">E-mail</ng-template>
                <ng-template #dados let-elemento="elemento">
                    {{ elemento.email }}
                </ng-template>

                <ng-template sortBy="status">Status</ng-template>
                <ng-template #dados let-elemento="elemento">
                    @switch (elemento.status) {
                        @case ('ativo') {
                            <span style="color: green;">✓ Ativo</span>
                        }
                        @case ('inativo') {
                            <span style="color: red;">✗ Inativo</span>
                        }
                    }
                </ng-template>
            </app-tabela>
        }
    `
})
export class UsuariosComponent {
    // State signals
    readonly loading = signal(false);
    readonly usuarios = signal<Usuario[]>([]);
    readonly termoBusca = signal('');
    readonly selecionados = signal<Usuario[]>([]);

    // Computed signals
    readonly usuariosFiltrados = computed(() => {
        const users = this.usuarios();
        const termo = this.termoBusca();
        
        if (!termo) return users;
        
        return users.filter(u => 
            u.nome.toLowerCase().includes(termo.toLowerCase())
        );
    });

    readonly totalSelecionados = computed(() => 
        this.selecionados().length
    );

    constructor() {
        this.carregarUsuarios();
    }

    carregarUsuarios(): void {
        this.loading.set(true);
        
        // Simular API call
        setTimeout(() => {
            this.usuarios.set([
                { id: 1, nome: 'João Silva', email: 'joao@email.com', status: 'ativo' },
                { id: 2, nome: 'Maria Santos', email: 'maria@email.com', status: 'ativo' },
                { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', status: 'inativo' },
            ]);
            this.loading.set(false);
        }, 1000);
    }

    onSelecionar(usuario: Usuario & { check: boolean }): void {
        this.selecionados.update(items => {
            if (usuario.check) {
                return [...items, usuario];
            } else {
                return items.filter(u => u.id !== usuario.id);
            }
        });
    }

    onBuscar(termo: string): void {
        this.termoBusca.set(termo);
    }

    exportar(): void {
        console.log('Exportando:', this.selecionados());
    }

    adicionar(): void {
        const novoId = Math.max(...this.usuarios().map(u => u.id), 0) + 1;
        
        this.usuarios.update(users => [
            ...users,
            {
                id: novoId,
                nome: `Novo Usuário ${novoId}`,
                email: `user${novoId}@email.com`,
                status: 'ativo'
            }
        ]);
    }
}
```

---

## 🏗️ Arquitetura

### Componente Principal
```
TabelaComponent
├── Input Signals (14 propriedades)
├── Output Signals (7 eventos)
├── State Signals (10 estados internos)
├── Computed Signals (1 - itensProcessados)
├── Effects (1 - monitorar itens)
└── ViewChild/ContentChild Signals (6 referências)
```

### Sub-componentes
```
PaginacaoComponent
├── Input Signals (6 propriedades)
├── Output Signals (1 evento)
├── State Signals (3 estados)
└── Computed Signals (2 - totalPages, paginationConfig)
```

### Utilities
```
FiltrarDadosPipe (standalone)
SliceDadosPipe (standalone)
TabelaHeaderDirective (standalone)
```

---

## 📦 Como Importar

### Opção 1: NgModule (tradicional)

```typescript
import { TabelaModule } from './shared/components/tabela';

@NgModule({
    imports: [TabelaModule],
    // ...
})
export class MeuModule {}
```

### Opção 2: Standalone Component

```typescript
import { TabelaStandaloneImports } from './shared/components/tabela/tabela-standalone';

@Component({
    standalone: true,
    imports: [TabelaStandaloneImports],
    // ...
})
export class MeuComponent {}
```

### Opção 3: Imports Individuais

```typescript
import { 
    TabelaComponent,
    TabelaHeaderDirective,
    FiltrarDadosPipe,
    SliceDadosPipe 
} from './shared/components/tabela';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TabelaHeaderDirective,
        FiltrarDadosPipe,
        SliceDadosPipe
    ],
    // ...
})
```

---

## 🚀 Performance

### Change Detection Otimizada

Com signals, apenas as partes necessárias são re-renderizadas:

```typescript
// Quando currentPage() muda, apenas a paginação é re-renderizada
this.currentPage.set(2);

// Quando itens() muda, o computed itensProcessados() é recalculado
this.itens.set(novosItens);
```

### OnPush Strategy Ready

```typescript
@Component({
    selector: 'app-tabela',
    changeDetection: ChangeDetectionStrategy.OnPush, // Funciona perfeitamente!
    // ...
})
```

---

## 📝 Checklist de Migração para Angular 19.2

- [x] Converter @Input para input()
- [x] Converter @Output para output()
- [x] Converter propriedades para signals
- [x] Criar computed signals
- [x] Adicionar effects
- [x] Converter @ViewChild para viewChild()
- [x] Converter @ContentChildren para contentChildren()
- [x] Migrar *ngIf para @if
- [x] Migrar *ngFor para @for
- [x] Tornar pipes standalone
- [x] Tornar diretivas standalone
- [x] Atualizar testes
- [x] Atualizar documentação

---

## 🎉 Resultado

✅ **100% Angular 19.2 Compliant**  
✅ **Signals API Completa**  
✅ **Nova Sintaxe de Templates**  
✅ **Standalone Ready**  
✅ **Performance Otimizada**  
✅ **Type Safe**  

---

**Atualizado para Angular 19.2 em 2025-01-09**



