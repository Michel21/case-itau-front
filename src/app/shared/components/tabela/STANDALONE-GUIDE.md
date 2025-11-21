# 🚀 Guia Standalone - Angular 19.2

## ✅ Componente 100% Standalone

Todos os componentes, pipes e diretivas foram convertidos para **standalone**, seguindo as melhores práticas do Angular 19.2.

---

## 📦 O que é Standalone?

Componentes standalone **não precisam de NgModule** para funcionar. Eles declaram suas próprias dependências.

### Antes (com NgModule):
```typescript
// módulo.ts
@NgModule({
  declarations: [TabelaComponent],
  imports: [CommonModule],
  exports: [TabelaComponent]
})
export class TabelaModule {}

// uso
import { TabelaModule } from './tabela.module';
```

### Agora (Standalone):
```typescript
// tabela.component.ts
@Component({
  standalone: true,
  imports: [CommonModule, ...],
  // ...
})
export class TabelaComponent {}

// uso
import { TabelaComponent } from './tabela.component';
```

---

## 🎯 Como Usar

### Método 1: Import Direto (Recomendado)

```typescript
import { Component, signal } from '@angular/core';
import { TabelaComponent } from './shared/components/tabela';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [TabelaComponent], // 👈 Import direto
  template: `
    <app-tabela [itens]="dados()">
      <ng-template sortBy="nome">Nome</ng-template>
      <ng-template #dados let-elemento="elemento">
        {{ elemento.nome }}
      </ng-template>
    </app-tabela>
  `
})
export class UsuariosComponent {
  readonly dados = signal([
    { nome: 'João', email: 'joao@email.com' }
  ]);
}
```

### Método 2: Com Pipes e Diretivas

```typescript
import { TabelaComponent, TabelaHeaderDirective } from './shared/components/tabela';

@Component({
  standalone: true,
  imports: [
    TabelaComponent,
    TabelaHeaderDirective // Se usar fora da tabela
  ],
  // ...
})
```

### Método 3: Em Rotas

```typescript
// rotas.ts
export const routes: Routes = [
  {
    path: 'tabela-demo',
    loadComponent: () => import('./tabela/tabela-example.component')
      .then(m => m.TabelaExampleComponent)
  }
];
```

---

## 📋 Componentes Disponíveis

Todos são **standalone**:

| Componente | Import |
|------------|--------|
| `TabelaComponent` | `import { TabelaComponent } from './tabela'` |
| `PaginacaoComponent` | `import { PaginacaoComponent } from './tabela'` |
| `TabelaHeaderDirective` | `import { TabelaHeaderDirective } from './tabela'` |
| `FiltrarDadosPipe` | `import { FiltrarDadosPipe } from './tabela'` |
| `SliceDadosPipe` | `import { SliceDadosPipe } from './tabela'` |

---

## 🎯 Exemplos Completos

### Exemplo 1: Componente Standalone Simples

```typescript
import { Component, signal } from '@angular/core';
import { TabelaComponent } from './shared/components/tabela';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [TabelaComponent],
  template: `
    <app-tabela [itens]="produtos()">
      <ng-template sortBy="nome">Produto</ng-template>
      <ng-template #dados let-elemento="elemento">
        {{ elemento.nome }}
      </ng-template>

      <ng-template sortBy="preco">Preço</ng-template>
      <ng-template #dados let-elemento="elemento">
        R$ {{ elemento.preco | number:'1.2-2' }}
      </ng-template>
    </app-tabela>
  `
})
export class ProdutosComponent {
  readonly produtos = signal([
    { nome: 'Notebook', preco: 3500 },
    { nome: 'Mouse', preco: 150 },
    { nome: 'Teclado', preco: 350 }
  ]);
}
```

### Exemplo 2: Com Paginação e Busca

```typescript
import { Component, signal } from '@angular/core';
import { TabelaComponent } from './shared/components/tabela';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [TabelaComponent],
  template: `
    <app-tabela 
      [itens]="clientes()"
      [temPaginacao]="true"
      [buscaMostrarCampo]="true"
      [buscaAtivarBuscaEstatica]="true"
      [buscarNasPropriedades]="['nome', 'email']">
      
      <ng-template sortBy="nome">Nome</ng-template>
      <ng-template #dados let-elemento="elemento">
        {{ elemento.nome }}
      </ng-template>

      <ng-template sortBy="email">E-mail</ng-template>
      <ng-template #dados let-elemento="elemento">
        {{ elemento.email }}
      </ng-template>
    </app-tabela>
  `
})
export class ClientesComponent {
  readonly clientes = signal(
    Array(200).fill(0).map((_, i) => ({
      id: i + 1,
      nome: `Cliente ${i + 1}`,
      email: `cliente${i + 1}@email.com`
    }))
  );
}
```

### Exemplo 3: Com Checkbox e Eventos

```typescript
import { Component, signal, computed } from '@angular/core';
import { TabelaComponent } from './shared/components/tabela';

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [TabelaComponent],
  template: `
    <app-tabela 
      [itens]="tarefas()"
      [temCheckbox]="true"
      (checkboxRowClick)="onSelecionar($event)">
      
      <ng-template sortBy="titulo">Tarefa</ng-template>
      <ng-template #dados let-elemento="elemento">
        {{ elemento.titulo }}
      </ng-template>

      <ng-template sortBy="status">Status</ng-template>
      <ng-template #dados let-elemento="elemento">
        {{ elemento.status }}
      </ng-template>
    </app-tabela>

    @if (totalSelecionadas() > 0) {
      <p>Selecionadas: {{ totalSelecionadas() }}</p>
    }
  `
})
export class TarefasComponent {
  readonly tarefas = signal([
    { id: 1, titulo: 'Tarefa 1', status: 'Pendente' },
    { id: 2, titulo: 'Tarefa 2', status: 'Concluída' }
  ]);

  readonly selecionadas = signal<any[]>([]);

  readonly totalSelecionadas = computed(() => 
    this.selecionadas().length
  );

  onSelecionar(tarefa: any): void {
    this.selecionadas.update(items => {
      if (tarefa.check) {
        return [...items, tarefa];
      } else {
        return items.filter(t => t.id !== tarefa.id);
      }
    });
  }
}
```

---

## 🔧 Vantagens do Standalone

### 1. **Menos Boilerplate**
- ✅ Não precisa criar NgModule
- ✅ Imports mais diretos
- ✅ Código mais limpo

### 2. **Lazy Loading Mais Fácil**
```typescript
{
  path: 'tabela',
  loadComponent: () => import('./tabela.component')
    .then(m => m.TabelaComponent)
}
```

### 3. **Tree Shaking Melhor**
- ✅ Apenas o que você usa é incluído no bundle
- ✅ Bundles menores
- ✅ Performance melhor

### 4. **Mais Fácil de Testar**
```typescript
await TestBed.configureTestingModule({
  imports: [TabelaComponent] // Só isso!
}).compileComponents();
```

---

## 📝 Migração de NgModule para Standalone

### Se você estava usando TabelaModule:

**Antes:**
```typescript
import { TabelaModule } from './shared/components/tabela';

@NgModule({
  imports: [TabelaModule]
})
```

**Agora:**
```typescript
import { TabelaComponent } from './shared/components/tabela';

@Component({
  standalone: true,
  imports: [TabelaComponent]
})
```

---

## 🎯 Estrutura Standalone

```
tabela/
├── tabela.component.ts        ← Standalone ✓
├── paginacao.component.ts     ← Standalone ✓
├── filtrar-dados.pipe.ts      ← Standalone ✓
├── slice-dados.pipe.ts        ← Standalone ✓
├── tabela-header.directive.ts ← Standalone ✓
└── index.ts                   ← Exports
```

**Todos os arquivos são independentes e podem ser importados diretamente!**

---

## 🚀 Como Começar

### Passo 1: Importar o Componente

```typescript
import { TabelaComponent } from './shared/components/tabela';
```

### Passo 2: Adicionar nos Imports

```typescript
@Component({
  standalone: true,
  imports: [TabelaComponent],
  // ...
})
```

### Passo 3: Usar no Template

```html
<app-tabela [itens]="dados()">
  <ng-template sortBy="campo">Campo</ng-template>
  <ng-template #dados let-elemento="elemento">
    {{ elemento.campo }}
  </ng-template>
</app-tabela>
```

---

## ✅ Checklist de Uso

- [ ] Importei `TabelaComponent` do caminho correto?
- [ ] Adicionei nos `imports` do meu componente standalone?
- [ ] Estou passando dados como signal: `[itens]="dados()"`?
- [ ] Tenho pelo menos um par de templates `sortBy` e `#dados`?
- [ ] Verifiquei o console do navegador (F12)?

---

## 🎉 Benefícios Alcançados

- ✅ **100% Standalone** - Sem dependência de NgModule
- ✅ **Signals API** - Reatividade moderna
- ✅ **Tree Shaking** - Bundles menores
- ✅ **Lazy Loading** - Carregamento otimizado
- ✅ **Type Safe** - 100% tipado
- ✅ **Modern Angular** - Angular 19.2 compliant

---

## 📚 Arquivos Removidos

- ❌ `tabela.module.ts` - Não é mais necessário
- ❌ `tabela-standalone.ts` - Não é mais necessário

**Todos os componentes são standalone por padrão!**

---

## 💡 Dicas

1. **Sempre use parênteses** ao passar signals:
   ```html
   [itens]="dados()"  ← Correto
   [itens]="dados"    ← Errado
   ```

2. **Imports são automáticos** no template:
   - Pipes são importados automaticamente
   - Diretivas são importadas automaticamente

3. **Lazy loading é mais fácil**:
   ```typescript
   loadComponent: () => import('./componente').then(m => m.Componente)
   ```

---

**Documentação atualizada para Angular 19.2 - Standalone Components**  
**Data:** 2025-01-09



