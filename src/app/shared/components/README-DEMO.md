# Demo Routes - Componentes

Este diretório contém as rotas e componentes de demonstração dos componentes compartilhados.

## 🚀 Rotas Disponíveis

### `/demo`
Página principal de navegação dos demos com lista de componentes disponíveis.

### `/demo/date-picker`
Demo interativo do componente DatePicker com exemplos práticos.

## 📁 Estrutura de Arquivos

```
shared/components/
├── demo.routes.ts                    # Rotas principais de demo
├── demo-nav/                         # Navegação dos demos
│   ├── demo-nav.component.ts         # Componente de navegação
│   └── index.ts                      # Exportações
├── date-picker/                      # Demo do DatePicker
│   ├── date-picker-demo.component.ts # Componente de demo
│   ├── date-picker-demo.routes.ts    # Rotas específicas
│   └── ...                           # Outros arquivos do DatePicker
└── README-DEMO.md                    # Esta documentação
```

## 🎯 Como Acessar

### Via Navegador
```
http://localhost:4200/demo
http://localhost:4200/demo/date-picker
```

### Via Código
```typescript
// Navegação programática
this.router.navigate(['/demo']);
this.router.navigate(['/demo/date-picker']);
```

## 🔧 Adicionando Novos Demos

### 1. Criar o Componente de Demo
```typescript
// novo-componente-demo.component.ts
@Component({
  selector: 'app-novo-componente-demo',
  standalone: true,
  template: `...`
})
export class NovoComponenteDemoComponent {}
```

### 2. Criar as Rotas
```typescript
// novo-componente-demo.routes.ts
export const novoComponenteDemoRoutes: Routes = [
  {
    path: '',
    component: NovoComponenteDemoComponent,
    title: 'Novo Componente Demo'
  }
];
```

### 3. Adicionar ao Demo Principal
```typescript
// demo.routes.ts
export const demoRoutes: Routes = [
  {
    path: 'novo-componente',
    loadChildren: () => import('./novo-componente/novo-componente-demo.routes').then(m => m.novoComponenteDemoRoutes)
  }
];
```

### 4. Atualizar a Navegação
```typescript
// demo-nav.component.ts
<a routerLink="/demo/novo-componente" class="demo-nav-link">
  <div class="demo-nav-icon">🆕</div>
  <div class="demo-nav-content">
    <h3>Novo Componente</h3>
    <p>Descrição do novo componente</p>
  </div>
</a>
```

## 🎨 Características dos Demos

### Design Consistente
- Interface moderna com gradientes
- Cards responsivos
- Navegação intuitiva
- Feedback visual

### Funcionalidades
- Exemplos interativos
- Log de eventos
- Configurações variadas
- Documentação inline

### Responsividade
- Mobile-first design
- Breakpoints otimizados
- Touch-friendly
- Acessibilidade

## 📱 Responsividade

Os demos são totalmente responsivos:

- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Layout adaptado com colunas reduzidas
- **Mobile**: Layout em coluna única otimizado

## ♿ Acessibilidade

- **ARIA Labels**: Todos os elementos têm labels apropriados
- **Navegação por Teclado**: Suporte completo
- **Contraste**: Cores com contraste adequado
- **Screen Readers**: Compatível com leitores de tela

## 🧪 Testes

Para testar as rotas:

```bash
# Testar build
ng build

# Testar em desenvolvimento
ng serve

# Acessar no navegador
http://localhost:4200/demo
```

## 📄 Licença

Este sistema de demos é parte do projeto case-itau-front e segue as mesmas diretrizes de licenciamento.

## 🤝 Contribuição

Para contribuir com novos demos:

1. Siga a estrutura de arquivos existente
2. Mantenha o design consistente
3. Adicione documentação adequada
4. Teste em diferentes dispositivos
5. Submeta um pull request

## 📞 Suporte

Para dúvidas sobre os demos:

- Consulte a documentação de cada componente
- Verifique os exemplos de código
- Abra uma issue no repositório
