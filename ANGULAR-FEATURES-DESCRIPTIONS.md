# 📚 Descrições Detalhadas das Funcionalidades do Angular

## 🏗️ **Arquitetura e Estrutura**

### **Componentes**

#### **Componentes Reutilizáveis**
**Descrição**: Unidades de UI modulares que encapsulam lógica, template e estilos. Permitem reutilização em diferentes partes da aplicação.

**Características**:
- Encapsulamento de funcionalidade
- Reutilização em múltiplos contextos
- Isolamento de responsabilidades
- Facilita manutenção e testes

**Exemplo**:
```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  `,
  styles: [`.user-card { border: 1px solid #ccc; }`]
})
export class UserCardComponent {
  @Input() user: User;
}
```

#### **Lifecycle Hooks**
**Descrição**: Métodos que permitem interceptar e reagir a eventos do ciclo de vida do componente.

**Hooks Principais**:
- `ngOnInit`: Inicialização do componente
- `ngOnDestroy`: Limpeza antes da destruição
- `ngAfterViewInit`: Após inicialização da view
- `ngOnChanges`: Quando inputs mudam

**Exemplo**:
```typescript
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('Componente inicializado');
  }
  
  ngOnDestroy() {
    console.log('Componente será destruído');
  }
}
```

#### **View Encapsulation**
**Descrição**: Sistema que isola estilos CSS do componente, evitando conflitos entre componentes.

**Tipos**:
- `Emulated` (padrão): Simula encapsulamento
- `Native`: Usa Shadow DOM nativo
- `None`: Sem encapsulamento

**Exemplo**:
```typescript
@Component({
  encapsulation: ViewEncapsulation.Emulated,
  styles: [`.my-class { color: red; }`]
})
```

#### **Change Detection**
**Descrição**: Sistema que detecta mudanças no modelo e atualiza a view automaticamente.

**Estratégias**:
- `Default`: Verifica todos os componentes
- `OnPush`: Verifica apenas quando necessário

**Exemplo**:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {}
```

### **Módulos**

#### **NgModules**
**Descrição**: Unidades organizacionais que agrupam componentes, serviços e outras funcionalidades relacionadas.

**Características**:
- Declaração de componentes
- Importação de outros módulos
- Configuração de providers
- Lazy loading

**Exemplo**:
```typescript
@NgModule({
  declarations: [UserComponent, UserListComponent],
  imports: [CommonModule, FormsModule],
  providers: [UserService],
  exports: [UserComponent]
})
export class UserModule {}
```

#### **Lazy Loading**
**Descrição**: Carregamento sob demanda de módulos, melhorando performance inicial da aplicação.

**Benefícios**:
- Reduz tamanho inicial do bundle
- Melhora tempo de carregamento
- Carrega funcionalidades quando necessário

**Exemplo**:
```typescript
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  }
];
```

### **Injeção de Dependência**

#### **Dependency Injection**
**Descrição**: Sistema que gerencia dependências entre classes, facilitando teste e manutenção.

**Características**:
- Inversão de controle
- Facilita testes unitários
- Singleton por padrão
- Hierarquia de injeção

**Exemplo**:
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
}
```

## 🎯 **Data Binding e Interação**

### **Data Binding**

#### **Interpolation**
**Descrição**: Sintaxe `{{ }}` para exibir valores do componente no template.

**Características**:
- Exibição de valores
- Expressões JavaScript
- Filtros e pipes
- Segurança automática

**Exemplo**:
```html
<h1>{{ title }}</h1>
<p>{{ user.name | uppercase }}</p>
<span>{{ 1 + 1 }}</span>
```

#### **Property Binding**
**Descrição**: Vinculação de propriedades HTML com valores do componente usando `[property]="value"`.

**Uso**:
- Atributos HTML
- Propriedades de componentes
- Classes CSS
- Estilos inline

**Exemplo**:
```html
<img [src]="imageUrl" [alt]="imageAlt">
<button [disabled]="isDisabled">Click me</button>
<div [class.active]="isActive">Content</div>
```

#### **Event Binding**
**Descrição**: Vinculação de eventos HTML com métodos do componente usando `(event)="handler()"`.

**Características**:
- Eventos nativos do DOM
- Eventos customizados
- Passagem de parâmetros
- Objeto $event

**Exemplo**:
```html
<button (click)="onClick()">Click me</button>
<input (keyup)="onKeyUp($event)">
<custom-component (customEvent)="onCustomEvent($event)">
```

#### **Two-way Binding**
**Descrição**: Combinação de property e event binding para sincronização bidirecional usando `[(ngModel)]="value"`.

**Uso**:
- Formulários
- Inputs de usuário
- Sincronização automática

**Exemplo**:
```html
<input [(ngModel)]="userName" placeholder="Enter name">
<p>Hello, {{ userName }}!</p>
```

### **Diretivas**

#### **Structural Directives**
**Descrição**: Diretivas que alteram a estrutura do DOM, como `*ngIf`, `*ngFor`, `*ngSwitch`.

**Características**:
- Modificam estrutura do DOM
- Sintaxe com asterisco
- Lógica condicional
- Loops e repetição

**Exemplo**:
```html
<div *ngIf="isVisible">Visible content</div>
<li *ngFor="let item of items; trackBy: trackByFn">{{ item.name }}</li>
<div [ngSwitch]="status">
  <p *ngSwitchCase="'active'">Active</p>
  <p *ngSwitchDefault>Inactive</p>
</div>
```

#### **Attribute Directives**
**Descrição**: Diretivas que modificam aparência ou comportamento de elementos, como `ngClass`, `ngStyle`.

**Uso**:
- Classes CSS dinâmicas
- Estilos inline
- Comportamento de elementos

**Exemplo**:
```html
<div [ngClass]="{'active': isActive, 'disabled': isDisabled}">
<div [ngStyle]="{'color': textColor, 'font-size': fontSize + 'px'}">
```

### **Pipes**

#### **Built-in Pipes**
**Descrição**: Pipes nativos do Angular para transformação de dados, como `date`, `currency`, `uppercase`.

**Pipes Comuns**:
- `date`: Formatação de datas
- `currency`: Formatação de moeda
- `uppercase/lowercase`: Transformação de texto
- `json`: Exibição de objetos JSON

**Exemplo**:
```html
<p>{{ date | date:'dd/MM/yyyy' }}</p>
<p>{{ price | currency:'BRL' }}</p>
<p>{{ text | uppercase }}</p>
```

#### **Custom Pipes**
**Descrição**: Pipes personalizados para transformações específicas da aplicação.

**Características**:
- Transformação de dados
- Reutilização em templates
- Parâmetros opcionais
- Performance otimizada

**Exemplo**:
```typescript
@Pipe({ name: 'reverse' })
export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('').reverse().join('');
  }
}
```

## 🛣️ **Roteamento e Navegação**

### **Router**

#### **Routes**
**Descrição**: Configuração de rotas que mapeiam URLs para componentes.

**Características**:
- Mapeamento URL → Componente
- Parâmetros de rota
- Query parameters
- Nested routes

**Exemplo**:
```typescript
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'user/:id', component: UserComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module') }
];
```

#### **Route Guards**
**Descrição**: Serviços que controlam acesso a rotas, como `CanActivate`, `CanLoad`.

**Tipos**:
- `CanActivate`: Pode ativar a rota
- `CanLoad`: Pode carregar o módulo
- `CanDeactivate`: Pode sair da rota
- `Resolve`: Pré-carrega dados

**Exemplo**:
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

### **Navegação**

#### **RouterLink**
**Descrição**: Diretiva para navegação declarativa entre rotas.

**Características**:
- Navegação declarativa
- Classes CSS automáticas
- Parâmetros de rota
- Query parameters

**Exemplo**:
```html
<a routerLink="/home">Home</a>
<a [routerLink]="['/user', userId]">User Profile</a>
<a routerLink="/search" [queryParams]="{q: 'angular'}">Search</a>
```

#### **Router Service**
**Descrição**: Serviço para navegação programática entre rotas.

**Métodos**:
- `navigate()`: Navega para rota
- `navigateByUrl()`: Navega por URL
- `navigateBack()`: Volta na história
- `navigateForward()`: Avança na história

**Exemplo**:
```typescript
constructor(private router: Router) {}

goToUser(id: number) {
  this.router.navigate(['/user', id]);
}
```

## 📝 **Formulários**

### **Template-driven Forms**

#### **NgModel**
**Descrição**: Diretiva para two-way binding em formulários baseados em template.

**Características**:
- Two-way binding
- Validação automática
- Estado do formulário
- Classes CSS automáticas

**Exemplo**:
```html
<form #userForm="ngForm">
  <input name="name" ngModel required #name="ngModel">
  <div *ngIf="name.invalid && name.touched">
    Name is required
  </div>
</form>
```

### **Reactive Forms**

#### **FormBuilder**
**Descrição**: Serviço para construção de formulários reativos de forma declarativa.

**Características**:
- Construção declarativa
- Validação síncrona e assíncrona
- Controle granular
- Testabilidade

**Exemplo**:
```typescript
export class UserFormComponent {
  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    age: [0, Validators.min(18)]
  });

  constructor(private fb: FormBuilder) {}
}
```

#### **FormControl**
**Descrição**: Classe que representa um controle individual de formulário.

**Características**:
- Valor e estado
- Validação
- Eventos de mudança
- Métodos de controle

**Exemplo**:
```typescript
export class MyComponent {
  nameControl = new FormControl('', Validators.required);
  
  ngOnInit() {
    this.nameControl.valueChanges.subscribe(value => {
      console.log('Name changed:', value);
    });
  }
}
```

## 🔄 **HTTP e Comunicação**

### **HTTP Client**

#### **HttpClient**
**Descrição**: Serviço moderno para requisições HTTP com suporte a observables.

**Características**:
- API baseada em observables
- Interceptação de requisições
- Tipagem TypeScript
- Suporte a diferentes formatos

**Exemplo**:
```typescript
@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
  
  createUser(user: User): Observable<User> {
    return this.http.post<User>('/api/users', user);
  }
}
```

#### **HTTP Interceptors**
**Descrição**: Serviços que interceptam requisições e respostas HTTP para adicionar funcionalidades.

**Uso**:
- Autenticação automática
- Tratamento de erros
- Loading indicators
- Logging

**Exemplo**:
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + this.getToken())
    });
    return next.handle(authReq);
  }
}
```

### **Observables e RxJS**

#### **Observables**
**Descrição**: Streams de dados assíncronos que permitem programação reativa.

**Características**:
- Streams de dados
- Operadores poderosos
- Cancelamento automático
- Composição de operações

**Exemplo**:
```typescript
export class DataService {
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data')
      .pipe(
        map(data => data.filter(item => item.active)),
        catchError(error => of([]))
      );
  }
}
```

#### **RxJS Operators**
**Descrição**: Operadores para transformação e manipulação de streams de dados.

**Operadores Comuns**:
- `map`: Transforma valores
- `filter`: Filtra valores
- `switchMap`: Muda para novo observable
- `mergeMap`: Combina observables
- `catchError`: Trata erros

**Exemplo**:
```typescript
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.searchService.search(term))
).subscribe(results => {
  this.results = results;
});
```

## 🎨 **Estilização e UI**

### **CSS e Styling**

#### **Component Styles**
**Descrição**: Sistema de estilos encapsulados por componente.

**Características**:
- Isolamento de estilos
- Encapsulamento automático
- Suporte a SCSS/SASS
- Estilos globais

**Exemplo**:
```typescript
@Component({
  styles: [`
    .my-component {
      color: red;
      font-size: 16px;
    }
  `]
})
export class MyComponent {}
```

### **Angular Material**

#### **Material Components**
**Descrição**: Biblioteca de componentes seguindo Material Design.

**Componentes Principais**:
- `MatButton`: Botões
- `MatCard`: Cards
- `MatInput`: Inputs
- `MatTable`: Tabelas
- `MatDialog`: Diálogos

**Exemplo**:
```html
<mat-card>
  <mat-card-header>
    <mat-card-title>User Profile</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <mat-form-field>
      <input matInput placeholder="Name" [(ngModel)]="name">
    </mat-form-field>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>Cancel</button>
    <button mat-raised-button color="primary">Save</button>
  </mat-card-actions>
</mat-card>
```

### **Animações**

#### **Angular Animations**
**Descrição**: Sistema de animações integrado ao Angular.

**Características**:
- Animações declarativas
- Transições suaves
- Keyframes
- Animações de rota

**Exemplo**:
```typescript
@Component({
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class MyComponent {}
```

## 🧪 **Testes**

### **Unit Testing**

#### **Jest/Karma**
**Descrição**: Frameworks para testes unitários de componentes e serviços.

**Características**:
- Testes isolados
- Mocks e spies
- Cobertura de código
- Execução rápida

**Exemplo**:
```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should get users', () => {
    const mockUsers = [{ id: 1, name: 'John' }];
    
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});
```

### **E2E Testing**

#### **Cypress**
**Descrição**: Framework moderno para testes end-to-end.

**Características**:
- Interface visual
- Debugging fácil
- Testes de integração
- Simulação de usuário

**Exemplo**:
```typescript
describe('User Management', () => {
  it('should create a new user', () => {
    cy.visit('/users');
    cy.get('[data-cy=add-user]').click();
    cy.get('[data-cy=name-input]').type('John Doe');
    cy.get('[data-cy=email-input]').type('john@example.com');
    cy.get('[data-cy=save-button]').click();
    cy.get('[data-cy=user-list]').should('contain', 'John Doe');
  });
});
```

## 🚀 **Performance e Otimização**

### **Performance**

#### **OnPush Strategy**
**Descrição**: Estratégia de detecção de mudanças que verifica apenas quando necessário.

**Benefícios**:
- Performance melhorada
- Controle granular
- Redução de verificações

**Exemplo**:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  @Input() data: Data;
}
```

#### **TrackBy Functions**
**Descrição**: Funções que otimizam renderização de listas identificando itens únicos.

**Benefícios**:
- Renderização eficiente
- Evita re-renderização desnecessária
- Performance melhorada

**Exemplo**:
```typescript
export class UserListComponent {
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

### **Angular Signals (v16+)**

#### **Signals**
**Descrição**: Sistema reativo moderno para gerenciamento de estado.

**Características**:
- Estado reativo
- Performance otimizada
- Sintaxe simples
- Integração com observables

**Exemplo**:
```typescript
export class MyComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(value => value + 1);
  }
}
```

## 🔧 **Ferramentas e Desenvolvimento**

### **CLI e Build**

#### **Angular CLI**
**Descrição**: Interface de linha de comando para desenvolvimento Angular.

**Comandos Principais**:
- `ng new`: Novo projeto
- `ng generate`: Gerar código
- `ng build`: Compilar
- `ng serve`: Servidor de desenvolvimento
- `ng test`: Executar testes

**Exemplo**:
```bash
ng new my-app
ng generate component user
ng generate service user
ng build --prod
ng serve --open
```

### **Development Tools**

#### **Angular DevTools**
**Descrição**: Extensão do navegador para debugging e profiling.

**Funcionalidades**:
- Inspector de componentes
- Profiler de performance
- Debugging de estado
- Análise de mudanças

## 📱 **PWA e Mobile**

### **Progressive Web App**

#### **Service Workers**
**Descrição**: Scripts que rodam em background para funcionalidades offline.

**Características**:
- Cache de recursos
- Funcionalidade offline
- Notificações push
- Sincronização em background

**Exemplo**:
```typescript
@Injectable()
export class PwaService {
  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      swUpdate.available.subscribe(() => {
        if (confirm('New version available. Load?')) {
          window.location.reload();
        }
      });
    }
  }
}
```

### **Mobile Development**

#### **Ionic**
**Descrição**: Framework para desenvolvimento de aplicações mobile híbridas.

**Características**:
- Componentes mobile
- Navegação nativa
- Performance otimizada
- Deploy multiplataforma

## 🏛️ **Arquitetura Avançada**

### **State Management**

#### **NgRx**
**Descrição**: Biblioteca para gerenciamento de estado baseada em Redux.

**Conceitos**:
- Store: Estado central
- Actions: Ações de mudança
- Reducers: Funções puras
- Effects: Efeitos colaterais
- Selectors: Seletores de estado

**Exemplo**:
```typescript
// Action
export const loadUsers = createAction('[User] Load Users');

// Reducer
export const userReducer = createReducer(
  initialState,
  on(loadUsers, (state) => ({ ...state, loading: true }))
);

// Effect
@Injectable()
export class UserEffects {
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map(users => loadUsersSuccess({ users }))
        )
      )
    )
  );
}
```

### **Micro Frontends**

#### **Module Federation**
**Descrição**: Técnica para implementar micro frontends com Webpack.

**Características**:
- Aplicações independentes
- Compartilhamento de código
- Deploy independente
- Escalabilidade

## 🔒 **Segurança**

### **Security Features**

#### **XSS Protection**
**Descrição**: Proteção automática contra ataques de Cross-Site Scripting.

**Características**:
- Sanitização automática
- Escape de HTML
- Content Security Policy
- Validação de entrada

#### **CSRF Protection**
**Descrição**: Proteção contra ataques de Cross-Site Request Forgery.

**Implementação**:
- Tokens CSRF
- Validação de origem
- Headers de segurança
- Cookies seguros

## 📊 **Monitoramento e Analytics**

### **Monitoring**

#### **Error Tracking**
**Descrição**: Sistema para rastreamento e análise de erros em produção.

**Ferramentas**:
- Sentry
- LogRocket
- Bugsnag
- Rollbar

#### **Performance Monitoring**
**Descrição**: Monitoramento de performance e métricas da aplicação.

**Métricas**:
- Tempo de carregamento
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift

## 🌐 **Internacionalização**

### **i18n Features**

#### **Angular i18n**
**Descrição**: Sistema nativo de internacionalização do Angular.

**Características**:
- Múltiplos idiomas
- Formatação de data/moeda
- Pluralização
- Lazy loading de traduções

**Exemplo**:
```html
<h1 i18n="@@welcome">Welcome to our app!</h1>
<p i18n="@@user-count" i18n-plural="@@user-count-plural">
  {count, plural, =0 {No users} =1 {One user} other {# users}}
</p>
```

---

## 🎯 **Resumo por Categoria**

### **Essenciais para Iniciantes**
- Componentes, Data Binding, Diretivas
- Roteamento, Formulários, HTTP
- Testes básicos, CLI

### **Intermediários**
- Services, DI, Pipes customizados
- Reactive Forms, Interceptors
- Performance básica, PWA

### **Avançados**
- State Management, Micro Frontends
- Performance crítica, Security
- Arquitetura enterprise

### **Modernos (v16+)**
- Signals, Standalone Components
- Control Flow, New Build System
- Server-Side Rendering

---

**💡 Nota**: Cada funcionalidade pode ter configurações adicionais e casos de uso específicos. Esta descrição fornece uma visão geral das principais características e benefícios de cada feature do Angular.
