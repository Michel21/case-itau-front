# TabelaComponent

Componente de tabela com funcionalidades de ordenação, paginação, busca, expansão de linhas e seleção.

## Módulo

Para usar o componente, importe o `TabelaModule` no seu módulo:

```typescript
import { TabelaModule } from './shared/components/tabela';

@NgModule({
  imports: [
    TabelaModule,
    // ... outros imports
  ]
})
export class SeuModule { }
```

## Atenção

Devido a uma correção no comportamento da ordenação de colunas, é recomendado identificar os cabeçalhos através da diretiva `sortBy`:

```html
<!-- RECOMENDADO -->
<ng-template sortBy="nome">Nome</ng-template>
<ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

<ng-template sortBy="cod">Código</ng-template>
<ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>
```

## Propriedades

### Inputs

* `@Input() labelAnterior = 'Anterior';` - Label para o botão da página anterior
* `@Input() labelProximo = 'Próximo';` - Label para o botão da página posterior
* `@Input() labelResultadosPorPagina = 'Resultados por página';` - Label ao lado do dropdown de quantidade
* `@Input() mostrarHeader = true` - Mostra ou esconde o cabeçalho da tabela
* `@Input() caption: string;` - Título da tabela com fundo azul
* `@Input() itens = [];` - Array de objetos com os dados da tabela
* `@Input() buscaMostrarCampo = false;` - Exibe campo de busca
* `@Input() buscaAtivarBuscaEstatica = true;` - Ativa busca estática (filtra localmente)
* `@Input() buscarNasPropriedades: Array<string>;` - Propriedades a serem consideradas na busca
* `@Input() desabilitarOrdenadacao: Array<number>;` - Índices das colunas sem ordenação
* `@Input() temPaginacao = false;` - Ativa paginação
* `@Input() temExpansivel = false;` - Ativa linhas expansíveis
* `@Input() temCheckbox = false;` - Exibe checkboxes para seleção
* `@Input() temRadioButton = false;` - Exibe radio buttons para seleção única

### Outputs

* `@Output() buscaOnChange = new EventEmitter<string>();` - Emite o valor da busca (debounce 200ms)
* `@Output() checkboxRowClick = new EventEmitter<any>();` - Emite a linha selecionada via checkbox
* `@Output() checkboxHeaderClick = new EventEmitter<boolean>();` - Emite estado do "selecionar todos"
* `@Output() radioButtonRowClick = new EventEmitter<any>();` - Emite a linha selecionada via radio
* `@Output() expandeRowClick = new EventEmitter<any>();` - Emite quando uma linha é expandida
* `@Output() onSetPageSize = new EventEmitter<number>();` - Emite quando o tamanho da página muda
* `@Output() onSort = new EventEmitter<string>();` - Emite a propriedade ordenada

## Exemplos

### Exemplo Básico

```html
<app-tabela [itens]="itens">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cod">Código</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>
</app-tabela>
```

```typescript
export class ExemploComponent {
    itens = [
        { nome: 'Item 1', cod: 'A123' },
        { nome: 'Item 2', cod: 'B456' },
        { nome: 'Item 3', cod: 'C789' }
    ];
}
```

### Exemplo - Busca Estática

```html
<app-tabela
    [itens]="itens"
    [buscaMostrarCampo]="true"
    [buscarNasPropriedades]="['nome', 'cod']"
    [buscaAtivarBuscaEstatica]="true">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cod">Código</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>
</app-tabela>
```

### Exemplo - Busca Dinâmica

```html
<app-tabela
    [itens]="itens"
    (buscaOnChange)="filtrarTabela($event)"
    [buscaMostrarCampo]="true"
    [buscaAtivarBuscaEstatica]="false">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>
</app-tabela>
```

```typescript
filtrarTabela(keyword: string) {
    // Fazer requisição ao backend com o keyword
    this.http.get<Array<any>>(`/api/dados?q=${keyword}`)
        .subscribe(dados => this.itens = dados);
}
```

### Exemplo - Paginação

```html
<app-tabela [itens]="itens" [temPaginacao]="true">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cod">Código</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>
</app-tabela>
```

```typescript
export class ExemploComponent {
    itens = Array(300).fill(0).map((x, i) => ({ 
        cod: (i + 1), 
        nome: `Item ${i + 1}`
    }));
}
```

### Exemplo - Expansível

```html
<app-tabela [itens]="itens" [temExpansivel]="true">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cod">Código</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>

    <ng-template #expansivel let-elemento="elemento">
        <div style="padding: 1rem;">
            <strong>Detalhes:</strong>
            <p>Código: {{ elemento.cod }}</p>
            <p>Descrição: {{ elemento.descricao }}</p>
        </div>
    </ng-template>
</app-tabela>
```

### Exemplo - Checkbox

```html
<app-tabela 
    [itens]="itens" 
    [temCheckbox]="true" 
    (checkboxRowClick)="checkboxRowClick($event)" 
    (checkboxHeaderClick)="checkboxHeaderClick($event)">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cod">Código</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>
</app-tabela>
```

```typescript
checkboxHeaderClick(selecionado: boolean) {
    console.log('Todos selecionados:', selecionado);
}

checkboxRowClick(linha: any) {
    console.log('Linha selecionada:', linha);
}
```

### Exemplo - Desabilitar Ordenação

```html
<app-tabela
    [itens]="itens"
    [desabilitarOrdenadacao]="[1, 2]">
    
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cod">Código (sem ordenação)</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cod }}</ng-template>

    <ng-template sortBy="status">Status (sem ordenação)</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.status }}</ng-template>
</app-tabela>
```

### Exemplo - Botões no Caption

```html
<app-tabela
    [itens]="itens"
    [temCheckbox]="true"
    caption="Minha Tabela">

    <ng-template #botoesCaption>
        <button (click)="acao1()">Ação 1</button>
        <button (click)="acao2()">Ação 2</button>
    </ng-template>

    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>
</app-tabela>
```

## Funcionalidades

### Ordenação
- Clique no cabeçalho para ordenar
- Suporta ordenação ascendente e descendente
- Funciona com strings, números e datas
- Possibilidade de desabilitar ordenação em colunas específicas

### Paginação
- Navegação entre páginas
- Seleção de quantidade de itens por página (50, 100, 150, 200)
- Indicadores de página atual

### Busca
- Busca estática (filtra dados localmente)
- Busca dinâmica (via evento para requisições ao backend)
- Possibilidade de definir quais propriedades serão consideradas

### Seleção
- Checkbox para múltipla seleção
- Radio button para seleção única
- Destaque visual das linhas selecionadas

### Expansível
- Linhas podem ser expandidas para mostrar mais detalhes
- Conteúdo customizável via template

## Customização

O componente pode ser customizado através dos arquivos SCSS. Os principais seletores são:

- `.tabela-base` - Estilos da tabela
- `.arrow-sorter` - Estilos do indicador de ordenação
- `.linhaAzul` - Estilo da linha selecionada
- `.cor-linha-par` - Estilo das linhas pares
- `.paginacao-select` - Estilos da paginação

## Notas

- O componente utiliza pipes customizados para filtragem e paginação
- Suporta templates customizados para cabeçalhos, células e linhas expansíveis
- Totalmente responsivo e acessível



