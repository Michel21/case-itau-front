# CheckboxComponent

Componente de checkbox customizado com suporte a três estados (selecionado, desmarcado, parcial).

## Módulo

```typescript
import { CheckboxModule } from './shared/components/checkbox';
```

## Seletor

```html
<app-checkbox></app-checkbox>
```

## Propriedades

| Nome | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `@Input() attrTitle` | `string` | - | Atributo title do DOM |
| `@Input() disabled` | `boolean` | `false` | Habilita/desabilita o componente |
| `@Input() enableMixed` | `boolean` | `false` | Ativa três estados: true, false, undefined |
| `@Input() small` | `boolean` | `false` | Renderiza checkbox menor |
| `@Input() tabindex` | `number` | `0` | Atributo tabindex |
| `@Input() titulo` | `string` | - | Texto ao lado do checkbox |
| `@Input() value` | `boolean \| undefined` | `false` | Valor inicial |
| `@Input() justificar` | `boolean` | `false` | Justifica espaço entre checkbox e label |
| `@Input() labelEsquerda` | `boolean` | `false` | Posiciona label à esquerda |
| `@Output() valueChange` | `EventEmitter<boolean \| undefined>` | - | Emite quando valor muda |

## Exemplos

### Básico

```html
<app-checkbox 
  titulo="Aceito os termos"
  [(ngModel)]="aceito">
</app-checkbox>
```

```typescript
export class MeuComponent {
  aceito = false;
}
```

### Três Estados (Mixed)

```html
<app-checkbox 
  titulo="Selecionar todos"
  [enableMixed]="true"
  [(ngModel)]="selecionarTodos"
  (ngModelChange)="onChangeSelecao()">
</app-checkbox>
```

```typescript
export class MeuComponent {
  selecionarTodos: boolean | undefined = false;

  onChangeSelecao() {
    // true, false ou undefined
    console.log(this.selecionarTodos);
  }
}
```

### Desabilitado

```html
<app-checkbox 
  titulo="Opção desabilitada"
  [disabled]="true"
  [value]="true">
</app-checkbox>
```

### Com Evento

```html
<app-checkbox 
  titulo="Notificar por email"
  (valueChange)="onNotificar($event)">
</app-checkbox>
```

```typescript
export class MeuComponent {
  onNotificar(checked: boolean | undefined) {
    console.log('Checkbox alterado:', checked);
  }
}
```

### Lista com Checkbox

```html
<app-checkbox 
  titulo="Selecionar todos"
  [enableMixed]="true"
  [(ngModel)]="checkboxPrincipal"
  (ngModelChange)="alterarTodos()">
</app-checkbox>

<div class="lista">
  <app-checkbox 
    *ngFor="let item of itens"
    [titulo]="item.nome"
    [(ngModel)]="item.selecionado"
    (ngModelChange)="verificarSelecao()">
  </app-checkbox>
</div>
```

```typescript
export class MeuComponent {
  checkboxPrincipal: boolean | undefined = false;
  
  itens = [
    { nome: 'Item 1', selecionado: false },
    { nome: 'Item 2', selecionado: false },
    { nome: 'Item 3', selecionado: false },
  ];

  alterarTodos() {
    if (this.checkboxPrincipal === true) {
      this.itens.forEach(item => item.selecionado = true);
    } else if (this.checkboxPrincipal === false) {
      this.itens.forEach(item => item.selecionado = false);
    }
  }

  verificarSelecao() {
    const todos = this.itens.every(item => item.selecionado);
    const nenhum = this.itens.every(item => !item.selecionado);
    
    if (todos) {
      this.checkboxPrincipal = true;
    } else if (nenhum) {
      this.checkboxPrincipal = false;
    } else {
      this.checkboxPrincipal = undefined; // Estado parcial
    }
  }
}
```

### Com FormControl

```html
<form [formGroup]="form">
  <app-checkbox 
    titulo="Concordo com os termos"
    formControlName="termos">
  </app-checkbox>
</form>
```

```typescript
export class MeuComponent {
  form = this.fb.group({
    termos: [false, Validators.requiredTrue]
  });

  constructor(private fb: FormBuilder) {}
}
```

### Label à Esquerda

```html
<app-checkbox 
  titulo="Texto à esquerda"
  [labelEsquerda]="true">
</app-checkbox>
```

### Justificado (Espaço entre)

```html
<app-checkbox 
  titulo="Opção justificada"
  [justificar]="true">
</app-checkbox>
```

### Checkbox Pequeno

```html
<app-checkbox 
  titulo="Checkbox pequeno"
  [small]="true">
</app-checkbox>
```

## Acessibilidade

O componente implementa as seguintes práticas de acessibilidade:

- **ARIA**: `role="checkbox"`, `aria-checked`, `aria-disabled`
- **Teclado**: Navegação com Tab, ativação com Enter ou Space
- **Focus**: Indicador visual ao receber foco

## Estados

### Selecionado (true)
- Fundo azul com check branco
- Texto em negrito

### Desmarcado (false)
- Borda azul sem preenchimento
- Texto normal

### Parcial (undefined)
- Fundo azul com traço branco
- Somente quando `enableMixed="true"`

### Desabilitado
- Cor cinza
- Cursor "not-allowed"
- Não responde a cliques

## Compatibilidade

✅ Angular 14+  
✅ Reactive Forms  
✅ Template-driven Forms  
✅ ngModel (two-way binding)  
✅ Acessibilidade ARIA  
✅ Navegação por teclado  

## Baseado em

LIB_CCP_V2/projects/ccpj-lib-componentes/src/lib/componentes/checkbox



