# 🚀 Guia Rápido - Componente Tabela

## ✅ Componente Criado com Sucesso!

O componente **Tabela** foi criado com base no componente do projeto `LIB_CCP_V2` e está pronto para uso.

## 📦 O que foi criado?

- ✅ Componente principal da tabela
- ✅ Componente de paginação
- ✅ Diretiva para ordenação de colunas
- ✅ Pipes para filtros e paginação
- ✅ Módulo completo
- ✅ Exemplos de uso
- ✅ Testes unitários
- ✅ Documentação completa

## 🎯 Como Usar em 3 Passos

### Passo 1: Importar o Módulo

No seu módulo (ex: `app.module.ts` ou módulo de feature):

```typescript
import { TabelaModule } from './shared/components/tabela';

@NgModule({
  imports: [
    TabelaModule,
    // ... outros módulos
  ]
})
export class AppModule { }
```

### Passo 2: Preparar os Dados

No seu componente TypeScript:

```typescript
export class MeuComponent {
  dados = [
    { nome: 'João Silva', email: 'joao@email.com', idade: 25 },
    { nome: 'Maria Santos', email: 'maria@email.com', idade: 30 },
    { nome: 'Pedro Costa', email: 'pedro@email.com', idade: 28 },
  ];
}
```

### Passo 3: Adicionar no Template

No seu template HTML:

```html
<app-tabela [itens]="dados">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="email">E-mail</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.email }}</ng-template>

    <ng-template sortBy="idade">Idade</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.idade }}</ng-template>
</app-tabela>
```

## 🎨 Exemplos Prontos para Copiar

### Tabela com Paginação

```html
<app-tabela [itens]="dados" [temPaginacao]="true">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="email">E-mail</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.email }}</ng-template>
</app-tabela>
```

### Tabela com Busca

```html
<app-tabela 
    [itens]="dados"
    [buscaMostrarCampo]="true"
    [buscaAtivarBuscaEstatica]="true"
    [buscarNasPropriedades]="['nome', 'email']">
    
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="email">E-mail</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.email }}</ng-template>
</app-tabela>
```

### Tabela com Checkbox (Seleção Múltipla)

```html
<app-tabela 
    [itens]="dados"
    [temCheckbox]="true"
    (checkboxRowClick)="aoSelecionar($event)"
    (checkboxHeaderClick)="aoSelecionarTodos($event)">
    
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="status">Status</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.status }}</ng-template>
</app-tabela>
```

No componente TypeScript:

```typescript
aoSelecionar(item: any) {
    console.log('Item selecionado:', item);
}

aoSelecionarTodos(selecionado: boolean) {
    console.log('Todos selecionados:', selecionado);
}
```

### Tabela com Linhas Expansíveis

```html
<app-tabela [itens]="dados" [temExpansivel]="true">
    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="cargo">Cargo</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.cargo }}</ng-template>

    <!-- Conteúdo que aparece quando a linha é expandida -->
    <ng-template #expansivel let-elemento="elemento">
        <div style="padding: 1rem; background: #f5f5f5;">
            <h4>Detalhes de {{ elemento.nome }}</h4>
            <p><strong>E-mail:</strong> {{ elemento.email }}</p>
            <p><strong>Telefone:</strong> {{ elemento.telefone }}</p>
            <p><strong>Endereço:</strong> {{ elemento.endereco }}</p>
        </div>
    </ng-template>
</app-tabela>
```

### Tabela com Título e Botões de Ação

```html
<app-tabela 
    [itens]="dados"
    [temCheckbox]="true"
    caption="Lista de Usuários">
    
    <!-- Botões que aparecem no cabeçalho da tabela -->
    <ng-template #botoesCaption>
        <button (click)="exportar()">Exportar</button>
        <button (click)="adicionar()">Adicionar Novo</button>
    </ng-template>

    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="status">Status</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.status }}</ng-template>
</app-tabela>
```

## 🔥 Exemplo Completo - Tudo Junto

```html
<app-tabela 
    [itens]="usuarios"
    [temPaginacao]="true"
    [temCheckbox]="true"
    [temExpansivel]="true"
    [buscaMostrarCampo]="true"
    [buscaAtivarBuscaEstatica]="true"
    [buscarNasPropriedades]="['nome', 'email']"
    caption="Gerenciamento de Usuários"
    (checkboxRowClick)="aoSelecionarUsuario($event)">
    
    <ng-template #botoesCaption>
        <button (click)="exportarSelecionados()">Exportar Selecionados</button>
        <button (click)="adicionarUsuario()">Novo Usuário</button>
    </ng-template>

    <ng-template sortBy="nome">Nome</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

    <ng-template sortBy="email">E-mail</ng-template>
    <ng-template #dados let-elemento="elemento">{{ elemento.email }}</ng-template>

    <ng-template sortBy="status">Status</ng-template>
    <ng-template #dados let-elemento="elemento">
        <span [style.color]="elemento.status === 'Ativo' ? 'green' : 'red'">
            {{ elemento.status }}
        </span>
    </ng-template>

    <ng-template #expansivel let-elemento="elemento">
        <div style="padding: 1rem; background: #f5f5f5;">
            <h4>Informações Detalhadas</h4>
            <p><strong>CPF:</strong> {{ elemento.cpf }}</p>
            <p><strong>Telefone:</strong> {{ elemento.telefone }}</p>
            <p><strong>Cargo:</strong> {{ elemento.cargo }}</p>
            <p><strong>Departamento:</strong> {{ elemento.departamento }}</p>
        </div>
    </ng-template>
</app-tabela>
```

Componente TypeScript:

```typescript
export class UsuariosComponent {
    usuarios = [
        {
            nome: 'João Silva',
            email: 'joao@empresa.com',
            status: 'Ativo',
            cpf: '123.456.789-00',
            telefone: '(11) 98765-4321',
            cargo: 'Desenvolvedor',
            departamento: 'TI'
        },
        {
            nome: 'Maria Santos',
            email: 'maria@empresa.com',
            status: 'Ativo',
            cpf: '987.654.321-00',
            telefone: '(11) 98765-1234',
            cargo: 'Designer',
            departamento: 'Marketing'
        },
        // ... mais usuários
    ];

    aoSelecionarUsuario(usuario: any) {
        console.log('Usuário selecionado:', usuario);
    }

    exportarSelecionados() {
        console.log('Exportando usuários selecionados...');
    }

    adicionarUsuario() {
        console.log('Adicionando novo usuário...');
    }
}
```

## 📋 Propriedades Principais

| Propriedade | Tipo | Padrão | O que faz |
|-------------|------|--------|-----------|
| `[itens]` | Array | `[]` | Dados da tabela |
| `[temPaginacao]` | boolean | `false` | Ativa paginação |
| `[temCheckbox]` | boolean | `false` | Adiciona checkboxes |
| `[temExpansivel]` | boolean | `false` | Permite expandir linhas |
| `[buscaMostrarCampo]` | boolean | `false` | Mostra campo de busca |
| `[caption]` | string | - | Título da tabela |

## 🎯 Eventos Disponíveis

| Evento | Quando dispara | Dados retornados |
|--------|----------------|------------------|
| `(checkboxRowClick)` | Ao selecionar uma linha | Objeto da linha |
| `(checkboxHeaderClick)` | Ao clicar em "selecionar todos" | `true` ou `false` |
| `(buscaOnChange)` | Ao digitar na busca | Texto digitado |
| `(expandeRowClick)` | Ao expandir uma linha | Índice e estado |
| `(onSort)` | Ao ordenar uma coluna | Nome da coluna |

## 📁 Arquivos Criados

```
src/app/shared/components/tabela/
├── tabela.component.ts       # Componente principal ⭐
├── tabela.component.html     # Template
├── tabela.component.scss     # Estilos
├── tabela.module.ts          # Módulo para importar ⭐
├── paginacao/                # Subcomponente de paginação
├── filtrar-dados.pipe.ts     # Pipe de filtro
├── slice-dados.pipe.ts       # Pipe de paginação
├── tabela-header.directive.ts # Diretiva de ordenação
├── tabela-example.component.ts # Exemplos prontos
└── README.md                 # Documentação completa
```

## 🚀 Próximos Passos

1. **Importar o módulo** no seu módulo principal
2. **Copiar um exemplo** acima que mais se adequa ao seu caso
3. **Adaptar os dados** para seu modelo de negócio
4. **Customizar os estilos** se necessário

## 📚 Documentação Completa

- `README.md` - Documentação detalhada com todos os exemplos
- `COMPONENT-SUMMARY.md` - Resumo técnico da implementação
- `tabela-example.component.ts` - Código de exemplos funcionais

## 💡 Dicas

1. **Use `sortBy` nos headers** para ativar ordenação naquela coluna
2. **O `#dados`** sempre usa `let-elemento="elemento"` para acessar os dados
3. **Para busca**, adicione `[buscarNasPropriedades]` com os campos desejados
4. **Templates expansíveis** permitem qualquer HTML customizado
5. **Eventos** podem ser capturados para integrar com seu backend

## ❓ Dúvidas Comuns

**P: Como mudar a quantidade de itens por página?**  
R: O usuário seleciona no dropdown que aparece quando `[temPaginacao]="true"`

**P: Como desabilitar a ordenação em uma coluna?**  
R: Use `[desabilitarOrdenadacao]="[0, 2]"` (índices das colunas)

**P: Posso usar componentes customizados dentro da tabela?**  
R: Sim! Use dentro do `<ng-template #dados>`

**P: Como estilizar linhas específicas?**  
R: Use `[ngClass]` ou `[ngStyle]` no template `#dados`

## ✅ Está Pronto!

O componente está **100% funcional** e pronto para uso. Basta seguir os exemplos acima! 🎉

---

**Desenvolvido com base no componente:** `LIB_CCP_V2/projects/ccpj-lib-componentes/src/lib/componentes/tabela`

