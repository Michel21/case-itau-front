# 📋 Checklist de Conceitos Principais do Angular

## 🏗️ **Arquitetura e Estrutura**

### **Componentes**
- [ ] **Componentes**: Unidades básicas de UI reutilizáveis
- [ ] **Template**: HTML com sintaxe Angular (interpolação, binding, diretivas)
- [ ] **Component Class**: Lógica TypeScript do componente
- [ ] **Metadata**: Decorator `@Component` com configurações
- [ ] **Lifecycle Hooks**: `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`, etc.
- [ ] **View Encapsulation**: Isolamento de estilos (Emulated, Native, None)
- [ ] **Change Detection**: Estratégias OnPush vs Default

### **Módulos**
- [ ] **NgModules**: Agrupamento de funcionalidades relacionadas
- [ ] **AppModule**: Módulo raiz da aplicação
- [ ] **Feature Modules**: Módulos de funcionalidades específicas
- [ ] **Shared Modules**: Módulos compartilhados
- [ ] **Lazy Loading**: Carregamento sob demanda de módulos
- [ ] **Module Imports/Exports**: Declarações e exportações

### **Serviços e Injeção de Dependência**
- [ ] **Services**: Classes para lógica de negócio e dados
- [ ] **Dependency Injection**: Sistema de injeção de dependências
- [ ] **Providers**: Configuração de serviços
- [ ] **Injectable**: Decorator para serviços
- [ ] **Singleton**: Padrão de instância única
- [ ] **Hierarchy**: Hierarquia de injeção de dependências

## 🎯 **Data Binding e Interação**

### **Data Binding**
- [ ] **Interpolation**: `{{ }}` para exibir dados
- [ ] **Property Binding**: `[property]="value"`
- [ ] **Event Binding**: `(event)="handler()"`
- [ ] **Two-way Binding**: `[(ngModel)]="value"`
- [ ] **String Interpolation**: Concatenação de strings
- [ ] **Expression Context**: Escopo de expressões

### **Diretivas**
- [ ] **Structural Directives**: `*ngIf`, `*ngFor`, `*ngSwitch`
- [ ] **Attribute Directives**: `ngClass`, `ngStyle`
- [ ] **Custom Directives**: Criação de diretivas personalizadas
- [ ] **Directive Input/Output**: Comunicação com diretivas
- [ ] **Host Binding**: Vinculação com elemento host

### **Pipes**
- [ ] **Built-in Pipes**: `date`, `currency`, `uppercase`, `lowercase`
- [ ] **Custom Pipes**: Criação de pipes personalizados
- [ ] **Pipe Transform**: Interface para transformação de dados
- [ ] **Pure vs Impure Pipes**: Otimização de performance
- [ ] **Pipe Parameters**: Passagem de parâmetros

## 🛣️ **Roteamento e Navegação**

### **Router**
- [ ] **Routes**: Configuração de rotas
- [ ] **RouterModule**: Módulo de roteamento
- [ ] **Router Outlet**: Exibição de componentes
- [ ] **Route Parameters**: Parâmetros de rota
- [ ] **Query Parameters**: Parâmetros de consulta
- [ ] **Route Guards**: Proteção de rotas
- [ ] **Lazy Loading**: Carregamento sob demanda
- [ ] **Child Routes**: Rotas aninhadas

### **Navegação**
- [ ] **RouterLink**: Navegação declarativa
- [ ] **Router Service**: Navegação programática
- [ ] **Navigation Events**: Eventos de navegação
- [ ] **Route Resolvers**: Pré-carregamento de dados
- [ ] **Route Data**: Dados estáticos de rota

## 📝 **Formulários**

### **Template-driven Forms**
- [ ] **NgModel**: Two-way binding em formulários
- [ ] **NgForm**: Referência ao formulário
- [ ] **NgModelGroup**: Agrupamento de campos
- [ ] **Form Validation**: Validação de formulários
- [ ] **Form State**: Estados de formulário

### **Reactive Forms**
- [ ] **FormBuilder**: Construtor de formulários
- [ ] **FormGroup**: Agrupamento de controles
- [ ] **FormControl**: Controle individual
- [ ] **FormArray**: Array de controles
- [ ] **Validators**: Validações personalizadas
- [ ] **Custom Validators**: Validações customizadas
- [ ] **Async Validators**: Validações assíncronas

## 🔄 **HTTP e Comunicação**

### **HTTP Client**
- [ ] **HttpClient**: Cliente HTTP
- [ ] **HTTP Methods**: GET, POST, PUT, DELETE
- [ ] **Request Options**: Configurações de requisição
- [ ] **Response Handling**: Tratamento de respostas
- [ ] **Error Handling**: Tratamento de erros
- [ ] **Interceptors**: Interceptação de requisições
- [ ] **Progress Events**: Eventos de progresso

### **Observables e RxJS**
- [ ] **Observables**: Streams de dados assíncronos
- [ ] **Operators**: `map`, `filter`, `switchMap`, `mergeMap`
- [ ] **Subjects**: Emissão de valores
- [ ] **BehaviorSubject**: Estado compartilhado
- [ ] **Async Pipe**: Subscrição automática
- [ ] **Memory Management**: `takeUntil`, `unsubscribe`

## 🎨 **Estilização e UI**

### **CSS e Styling**
- [ ] **Component Styles**: Estilos de componente
- [ ] **Global Styles**: Estilos globais
- [ ] **CSS Classes**: Classes CSS
- [ ] **CSS Variables**: Variáveis CSS
- [ ] **Responsive Design**: Design responsivo
- [ ] **CSS Frameworks**: Bootstrap, Material Design

### **Angular Material**
- [ ] **Material Components**: Componentes Material
- [ ] **Theming**: Sistema de temas
- [ ] **Typography**: Tipografia
- [ ] **Icons**: Ícones Material
- [ ] **Animations**: Animações Material

## 🧪 **Testes**

### **Unit Testing**
- [ ] **Jest/Karma**: Frameworks de teste
- [ ] **Jasmine**: Framework de asserções
- [ ] **TestBed**: Configuração de testes
- [ ] **Component Testing**: Testes de componente
- [ ] **Service Testing**: Testes de serviço
- [ ] **Mocking**: Simulação de dependências
- [ ] **Coverage**: Cobertura de testes

### **E2E Testing**
- [ ] **Protractor**: Testes end-to-end
- [ ] **Cypress**: Framework E2E moderno
- [ ] **User Interactions**: Simulação de interações
- [ ] **Page Object Model**: Padrão de organização

## 🚀 **Performance e Otimização**

### **Performance**
- [ ] **OnPush Strategy**: Estratégia de detecção de mudanças
- [ ] **TrackBy Functions**: Otimização de listas
- [ ] **Lazy Loading**: Carregamento sob demanda
- [ ] **Preloading**: Pré-carregamento de módulos
- [ ] **Tree Shaking**: Eliminação de código não usado
- [ ] **Bundle Optimization**: Otimização de bundles

### **Angular Signals (v16+)**
- [ ] **Signals**: Estado reativo
- [ ] **Computed**: Valores computados
- [ ] **Effect**: Efeitos colaterais
- [ ] **Signal Inputs**: Entradas reativas
- [ ] **Signal Queries**: Consultas reativas

## 🔧 **Ferramentas e Desenvolvimento**

### **CLI e Build**
- [ ] **Angular CLI**: Interface de linha de comando
- [ ] **ng generate**: Geração de código
- [ ] **ng build**: Compilação
- [ ] **ng serve**: Servidor de desenvolvimento
- [ ] **ng test**: Execução de testes
- [ ] **ng lint**: Análise de código

### **Debugging**
- [ ] **Angular DevTools**: Ferramentas de desenvolvimento
- [ ] **Source Maps**: Mapeamento de código
- [ ] **Console Logging**: Logs de depuração
- [ ] **Error Handling**: Tratamento de erros
- [ ] **Performance Profiling**: Análise de performance

## 📱 **PWA e Mobile**

### **Progressive Web App**
- [ ] **Service Workers**: Workers de serviço
- [ ] **Manifest**: Manifesto da aplicação
- [ ] **Offline Support**: Suporte offline
- [ ] **Push Notifications**: Notificações push
- [ ] **App Shell**: Shell da aplicação

### **Mobile Development**
- [ ] **Ionic**: Framework mobile
- [ ] **Cordova**: Aplicações híbridas
- [ ] **Capacitor**: Runtime nativo
- [ ] **Responsive Design**: Design responsivo

## 🏛️ **Arquitetura Avançada**

### **State Management**
- [ ] **NgRx**: Gerenciamento de estado
- [ ] **Actions**: Ações de estado
- [ ] **Reducers**: Redutores de estado
- [ ] **Selectors**: Seletores de estado
- [ ] **Effects**: Efeitos colaterais
- [ ] **Store**: Armazenamento de estado

### **Micro Frontends**
- [ ] **Module Federation**: Federação de módulos
- [ ] **Single-SPA**: Aplicação única
- [ ] **Web Components**: Componentes web
- [ ] **Micro Services**: Arquitetura de microserviços

## 🔒 **Segurança**

### **Security Best Practices**
- [ ] **XSS Protection**: Proteção contra XSS
- [ ] **CSRF Protection**: Proteção contra CSRF
- [ ] **Content Security Policy**: Política de segurança
- [ ] **Authentication**: Autenticação
- [ ] **Authorization**: Autorização
- [ ] **JWT Tokens**: Tokens JWT
- [ ] **HTTPS**: Comunicação segura

## 📊 **Monitoramento e Analytics**

### **Monitoring**
- [ ] **Error Tracking**: Rastreamento de erros
- [ ] **Performance Monitoring**: Monitoramento de performance
- [ ] **User Analytics**: Analytics de usuário
- [ ] **Logging**: Sistema de logs
- [ ] **Metrics**: Métricas de aplicação

---

## 🎯 **Níveis de Proficiência**

### **Iniciante (0-30%)**
- [ ] Componentes básicos
- [ ] Data binding simples
- [ ] Roteamento básico
- [ ] Formulários template-driven
- [ ] HTTP básico

### **Intermediário (30-70%)**
- [ ] Reactive forms
- [ ] Services e DI
- [ ] Pipes customizados
- [ ] Diretivas customizadas
- [ ] Testes unitários
- [ ] Performance básica

### **Avançado (70-90%)**
- [ ] Arquitetura complexa
- [ ] State management
- [ ] Otimizações avançadas
- [ ] Testes E2E
- [ ] PWA
- [ ] Micro frontends

### **Expert (90-100%)**
- [ ] Angular Signals
- [ ] Arquitetura enterprise
- [ ] Performance crítica
- [ ] Segurança avançada
- [ ] Contribuições open source
- [ ] Mentoria e liderança técnica

---

## 📚 **Recursos de Aprendizado**

### **Documentação Oficial**
- [ ] [Angular.io](https://angular.io)
- [ ] [Angular CLI](https://cli.angular.io)
- [ ] [Angular Material](https://material.angular.io)

### **Comunidade**
- [ ] [Angular GitHub](https://github.com/angular/angular)
- [ ] [Angular Blog](https://blog.angular.io)
- [ ] [Angular University](https://angular-university.io)

### **Prática**
- [ ] Projetos pessoais
- [ ] Contribuições open source
- [ ] Code reviews
- [ ] Pair programming
- [ ] Tech talks e workshops

---

**💡 Dica**: Marque os conceitos conforme você os domina e use este checklist para identificar áreas que precisam de mais estudo e prática!
