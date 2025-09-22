# 🎯 Guia Completo para Entrevistas de Angular

## 📋 **Preparação Pré-Entrevista**

### **Conceitos Fundamentais para Revisar**
- [ ] **Componentes**: Estrutura, lifecycle, comunicação
- [ ] **Serviços**: DI, singleton, providers
- [ ] **Roteamento**: guards, resolvers, lazy loading
- [ ] **Formulários**: template-driven vs reactive
- [ ] **HTTP**: interceptors, error handling
- [ ] **Testes**: unit, integration, e2e
- [ ] **Performance**: OnPush, trackBy, lazy loading

### **Projetos para Demonstrar**
- [ ] **CRUD completo** com validações
- [ ] **Roteamento** com guards e resolvers
- [ ] **Formulários reativos** com validações customizadas
- [ ] **Testes unitários** com boa cobertura
- [ ] **Performance** otimizada
- [ ] **PWA** ou funcionalidades offline

---

## 🗣️ **Perguntas Técnicas por Nível**

### **🟢 JÚNIOR (0-2 anos)**

#### **Conceitos Básicos**
1. **O que é Angular e como difere do AngularJS?**
   - **Resposta Esperada**: Framework baseado em TypeScript, arquitetura de componentes, sistema de módulos, CLI integrado
   - **Critérios de Avaliação**: 
     - Conhece diferenças fundamentais (TypeScript vs JavaScript, arquitetura)
     - Entende conceito de componentes vs controllers
     - Sabe mencionar CLI e ferramentas modernas
   - **Nível de Dificuldade**: Básico
   - **Tempo Estimado**: 3-5 minutos

2. **Explique o ciclo de vida de um componente**
   - **Resposta Esperada**: `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`, quando usar cada hook, diferenças entre hooks
   - **Critérios de Avaliação**:
     - Lista pelo menos 3-4 hooks principais
     - Explica quando usar cada um
     - Entende ordem de execução
     - Conhece diferenças entre hooks
   - **Nível de Dificuldade**: Básico-Intermediário
   - **Tempo Estimado**: 5-7 minutos

3. **Como funciona o data binding no Angular?**
   - **Resposta Esperada**: Interpolation `{{ }}`, Property binding `[property]="value"`, Event binding `(event)="handler()"`, Two-way binding `[(ngModel)]="value"`
   - **Critérios de Avaliação**:
     - Conhece os 4 tipos de binding
     - Entende direção de cada tipo
     - Sabe quando usar cada um
     - Conhece sintaxe correta
   - **Nível de Dificuldade**: Básico
   - **Tempo Estimado**: 4-6 minutos

4. **O que são diretivas e quais tipos existem?**
   - **Resposta Esperada**: Structural `*ngIf`, `*ngFor`, `*ngSwitch`, Attribute `ngClass`, `ngStyle`, Custom directives
   - **Critérios de Avaliação**:
     - Distingue entre tipos de diretivas
     - Conhece diretivas mais comuns
     - Entende sintaxe com asterisco
     - Sabe quando criar custom directives
   - **Nível de Dificuldade**: Básico
   - **Tempo Estimado**: 4-6 minutos

#### **Código Prático**
**Desafio**: Crie um componente que exibe uma lista de usuários
- **Objetivo**: Avaliar conhecimento de componentes, data binding e diretivas
- **Critérios de Avaliação**:
  - Usa `*ngFor` corretamente
  - Implementa `trackBy` para performance
  - Usa interpolation para exibir dados
  - Estrutura de componente adequada
- **Nível de Dificuldade**: Básico-Intermediário
- **Tempo Estimado**: 10-15 minutos
- **Pontos Extras**: TypeScript, interface User, lifecycle hooks

```typescript
// Solução Esperada
interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users; trackBy: trackByFn">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  `
})
export class UserListComponent {
  users: User[] = [];
  
  trackByFn(index: number, user: User): number {
    return user.id;
  }
}
```

**Perguntas de Aprofundamento**:
- Por que usar `trackBy`? (Performance)
- Como você carregaria os dados? (Service, HTTP)
- Como implementaria busca/filtro? (Pipe, método)

### **🟡 PLENO (2-5 anos)**

#### **Arquitetura e Padrões**
1. **Explique a arquitetura de um projeto Angular**
   - **Resposta Esperada**: Módulos e organização, estrutura de pastas, separação de responsabilidades, lazy loading
   - **Critérios de Avaliação**:
     - Entende organização de módulos (feature, shared, core)
     - Conhece estrutura de pastas recomendada
     - Sabe separar responsabilidades (components, services, models)
     - Entende lazy loading e code splitting
     - Conhece padrões de arquitetura (feature modules, barrel exports)
   - **Nível de Dificuldade**: Intermediário
   - **Tempo Estimado**: 8-12 minutos

2. **Como implementar comunicação entre componentes?**
   - **Resposta Esperada**: `@Input()` e `@Output()`, Services, EventEmitter, Subject/BehaviorSubject
   - **Critérios de Avaliação**:
     - Conhece comunicação pai-filho (Input/Output)
     - Entende comunicação entre irmãos (Services)
     - Sabe usar EventEmitter e Subject
     - Conhece padrões de comunicação (Observable, BehaviorSubject)
     - Entende quando usar cada método
   - **Nível de Dificuldade**: Intermediário
   - **Tempo Estimado**: 10-15 minutos

3. **Diferenças entre Template-driven e Reactive Forms**
   - **Resposta Esperada**: Quando usar cada um, validações, performance, testabilidade
   - **Critérios de Avaliação**:
     - Distingue entre os dois tipos
     - Conhece vantagens/desvantagens de cada um
     - Entende validações (síncrona vs assíncrona)
     - Sabe sobre performance e testabilidade
     - Conhece casos de uso específicos
   - **Nível de Dificuldade**: Intermediário-Avançado
   - **Tempo Estimado**: 12-18 minutos

4. **Como implementar autenticação e autorização?**
   - **Resposta Esperada**: Guards (CanActivate, CanLoad), Interceptors, JWT tokens, Role-based access
   - **Critérios de Avaliação**:
     - Conhece diferentes tipos de guards
     - Entende interceptors para tokens
     - Sabe implementar JWT
     - Conhece autorização baseada em roles
     - Entende fluxo completo de auth
   - **Nível de Dificuldade**: Intermediário-Avançado
   - **Tempo Estimado**: 15-20 minutos

#### **Código Prático**
**Desafio**: Implemente um serviço de autenticação completo
- **Objetivo**: Avaliar conhecimento de services, observables, HTTP e padrões de autenticação
- **Critérios de Avaliação**:
  - Implementa service com DI
  - Usa BehaviorSubject para estado
  - Implementa login/logout
  - Gerencia tokens (localStorage)
  - Usa HTTP client corretamente
  - Implementa observables
- **Nível de Dificuldade**: Intermediário-Avançado
- **Tempo Estimado**: 20-25 minutos
- **Pontos Extras**: Error handling, interceptors, guards

```typescript
// Solução Esperada
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
```

**Perguntas de Aprofundamento**:
- Como implementaria refresh token? (Observable, timer)
- Como protegeria rotas? (Guards, interceptors)
- Como lidaria com expiração de token? (Interceptor, auto-logout)
- Como implementaria remember me? (localStorage vs sessionStorage)

### **🔴 SÊNIOR (5+ anos)**

#### **Arquitetura Avançada**
1. **Como implementar state management sem NgRx?**
   - **Resposta Esperada**: Services com BehaviorSubject, Event-driven architecture, CQRS pattern, Event sourcing
   - **Critérios de Avaliação**:
     - Conhece padrões alternativos ao NgRx
     - Entende event-driven architecture
     - Sabe implementar CQRS
     - Conhece event sourcing
     - Entende trade-offs de cada abordagem
     - Sabe quando usar cada padrão
   - **Nível de Dificuldade**: Avançado
   - **Tempo Estimado**: 20-25 minutos

2. **Estratégias de otimização de performance**
   - **Resposta Esperada**: OnPush change detection, TrackBy functions, Lazy loading, Preloading strategies, Bundle optimization
   - **Critérios de Avaliação**:
     - Conhece estratégias de change detection
     - Entende otimizações de listas
     - Sabe sobre lazy loading e preloading
     - Conhece bundle optimization
     - Entende profiling e debugging
     - Sabe medir e monitorar performance
   - **Nível de Dificuldade**: Avançado
   - **Tempo Estimado**: 25-30 minutos

3. **Como implementar micro frontends?**
   - **Resposta Esperada**: Module Federation, Single-SPA, Web Components, Shared libraries
   - **Critérios de Avaliação**:
     - Conhece diferentes abordagens
     - Entende Module Federation
     - Sabe sobre Single-SPA
     - Conhece Web Components
     - Entende shared libraries
     - Sabe sobre deployment e versioning
   - **Nível de Dificuldade**: Avançado-Expert
   - **Tempo Estimado**: 30-35 minutos

4. **Arquitetura de testes**
   - **Resposta Esperada**: Test pyramid, Mocking strategies, E2E testing, Visual regression testing
   - **Critérios de Avaliação**:
     - Conhece test pyramid
     - Entende estratégias de mocking
     - Sabe sobre E2E testing
     - Conhece visual regression testing
     - Entende CI/CD para testes
     - Sabe sobre performance testing
   - **Nível de Dificuldade**: Avançado
   - **Tempo Estimado**: 20-25 minutos

#### **Código Prático**
**Desafio**: Implemente um interceptor para tratamento de erros completo
- **Objetivo**: Avaliar conhecimento de interceptors, error handling, routing e padrões avançados
- **Critérios de Avaliação**:
  - Implementa HttpInterceptor corretamente
  - Trata diferentes tipos de erro (401, 403, 500+)
  - Implementa navegação baseada em erro
  - Adiciona logging/monitoring
  - Usa RxJS operators corretamente
  - Implementa retry logic (opcional)
- **Nível de Dificuldade**: Avançado
- **Tempo Estimado**: 25-30 minutos
- **Pontos Extras**: Retry logic, custom error types, notification service

```typescript
// Solução Esperada
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.status === 401) {
          this.router.navigate(['/login']);
          errorMessage = 'Unauthorized access';
        } else if (error.status === 403) {
          this.router.navigate(['/forbidden']);
          errorMessage = 'Access forbidden';
        } else if (error.status === 404) {
          errorMessage = 'Resource not found';
        } else if (error.status >= 500) {
          errorMessage = 'Server error occurred';
          // Log to monitoring service
          this.logError(error);
        } else if (error.status === 0) {
          errorMessage = 'Network error';
        }
        
        this.notificationService.showError(errorMessage);
        return throwError(error);
      })
    );
  }

  private logError(error: HttpErrorResponse): void {
    // Implementation for error logging
    console.error('HTTP Error:', {
      status: error.status,
      message: error.message,
      url: error.url,
      timestamp: new Date().toISOString()
    });
  }
}
```

**Perguntas de Aprofundamento**:
- Como implementaria retry logic? (retry operator, exponential backoff)
- Como lidaria com diferentes tipos de erro? (custom error classes)
- Como implementaria circuit breaker? (resilience patterns)
- Como integraria com monitoring? (Sentry, LogRocket)

---

## 🧪 **Desafios Práticos**

### **Desafio 1: CRUD com Validações**
**Objetivo**: Avaliar conhecimento de Reactive Forms, validações customizadas e CRUD operations
- **Critérios de Avaliação**:
  - Implementa FormBuilder corretamente
  - Usa validações síncronas e assíncronas
  - Implementa validação customizada
  - Trata erros de validação
  - Implementa CRUD operations
  - Usa TypeScript adequadamente
- **Nível de Dificuldade**: Intermediário-Avançado
- **Tempo Estimado**: 30-40 minutos
- **Pontos Extras**: Async validators, custom validators, error handling

```typescript
// Solução Esperada
interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  description?: string;
}

@Component({
  selector: 'app-product-form',
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <input formControlName="name" placeholder="Nome do produto">
        <div *ngIf="productForm.get('name')?.hasError('required')" class="error">
          Nome é obrigatório
        </div>
        <div *ngIf="productForm.get('name')?.hasError('custom')" class="error">
          Nome deve ter pelo menos 3 caracteres
        </div>
      </div>
      
      <div class="form-group">
        <input formControlName="price" type="number" placeholder="Preço">
        <div *ngIf="productForm.get('price')?.hasError('min')" class="error">
          Preço deve ser maior que 0
        </div>
      </div>
      
      <div class="form-group">
        <select formControlName="category">
          <option value="">Selecione uma categoria</option>
          <option value="electronics">Eletrônicos</option>
          <option value="clothing">Roupas</option>
        </select>
        <div *ngIf="productForm.get('category')?.hasError('required')" class="error">
          Categoria é obrigatória
        </div>
      </div>
      
      <button type="submit" [disabled]="productForm.invalid || isSubmitting">
        {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
      </button>
    </form>
  `
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, this.customValidator]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Load product if editing
  }

  customValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.length < 3) {
      return { custom: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      const product: Product = this.productForm.value;
      
      this.productService.saveProduct(product).subscribe({
        next: (savedProduct) => {
          console.log('Product saved:', savedProduct);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error saving product:', error);
          this.isSubmitting = false;
        }
      });
    }
  }
}
```

**Perguntas de Aprofundamento**:
- Como implementaria validação assíncrona? (AsyncValidator)
- Como lidaria com upload de imagem? (FormData, FileReader)
- Como implementaria busca de categoria? (Autocomplete, API)
- Como validaria preço em tempo real? (debounce, API)

### **Desafio 2: Performance Optimization**
```typescript
// Otimize este componente para performance
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let user of users; trackBy: trackByUserId">
      <app-user-card [user]="user" (userSelected)="onUserSelected($event)">
      </app-user-card>
    </div>
  `
})
export class UserListComponent implements OnInit {
  @Input() users: User[] = [];
  @Output() userSelected = new EventEmitter<User>();

  constructor(private cdr: ChangeDetectorRef) {}

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  onUserSelected(user: User): void {
    this.userSelected.emit(user);
  }
}
```

### **Desafio 3: State Management**
```typescript
// Implemente um store simples sem NgRx
@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public users$ = this.usersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private userService: UserService) {}

  loadUsers(): void {
    this.loadingSubject.next(true);
    this.userService.getUsers().subscribe({
      next: users => {
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
      },
      error: error => {
        console.error('Error loading users:', error);
        this.loadingSubject.next(false);
      }
    });
  }

  addUser(user: User): void {
    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, user]);
  }

  updateUser(updatedUser: User): void {
    const currentUsers = this.usersSubject.value;
    const index = currentUsers.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      currentUsers[index] = updatedUser;
      this.usersSubject.next([...currentUsers]);
    }
  }
}
```

---

## 🎯 **Perguntas Comportamentais**

### **Situações Técnicas**
1. **"Como você lidaria com um bug de performance em produção?"**
   - Análise do problema
   - Ferramentas de debugging
   - Estratégias de otimização
   - Monitoramento

2. **"Como você implementaria uma funcionalidade complexa?"**
   - Planejamento e arquitetura
   - Quebra em tarefas menores
   - Testes e validação
   - Documentação

3. **"Como você manteria a qualidade do código em uma equipe?"**
   - Code reviews
   - Padrões de código
   - Ferramentas de qualidade
   - Mentoria

### **Liderança Técnica**
1. **"Como você escolheria entre diferentes soluções técnicas?"**
   - Análise de prós e contras
   - Consideração de contexto
   - Discussão com equipe
   - Documentação de decisões

2. **"Como você lidaria com resistência a mudanças técnicas?"**
   - Comunicação clara
   - Demonstração de benefícios
   - Treinamento e suporte
   - Implementação gradual

---

## 🛠️ **Ferramentas e Tecnologias**

### **Stack Técnico Esperado**
- [ ] **Angular 15+** com TypeScript
- [ ] **RxJS** para programação reativa
- [ ] **Angular Material** ou **PrimeNG**
- [ ] **Jest** ou **Jasmine** para testes
- [ ] **Cypress** ou **Playwright** para E2E
- [ ] **ESLint** e **Prettier**
- [ ] **Husky** para git hooks
- [ ] **Angular CLI** e **Nx**

### **Conceitos Avançados**
- [ ] **Angular Signals** (v16+)
- [ ] **Standalone Components**
- [ ] **Control Flow** (v17+)
- [ ] **Server-Side Rendering** (SSR)
- [ ] **Progressive Web Apps** (PWA)
- [ ] **Micro Frontends**

---

## 📚 **Recursos para Estudo**

### **Documentação Oficial**
- [Angular.io](https://angular.io)
- [Angular CLI](https://cli.angular.io)
- [Angular Material](https://material.angular.io)

### **Cursos e Tutoriais**
- [Angular University](https://angular-university.io)
- [Angular Academy](https://angular.academy)
- [Pluralsight Angular](https://www.pluralsight.com)

### **Projetos Práticos**
- [Angular Real World App](https://github.com/gothinkster/angular-realworld-example-app)
- [Angular Shopping Cart](https://github.com/angular/angular)
- [Angular PWA Examples](https://github.com/angular/angular)

---

## 🎯 **Dicas para a Entrevista**

### **Antes da Entrevista**
- [ ] **Revise conceitos fundamentais**
- [ ] **Prepare exemplos de código**
- [ ] **Pratique explicações técnicas**
- [ ] **Prepare perguntas sobre a empresa**

### **Durante a Entrevista**
- [ ] **Seja claro e objetivo**
- [ ] **Use exemplos práticos**
- [ ] **Admita quando não souber**
- [ ] **Faça perguntas relevantes**
- [ ] **Demonstre pensamento crítico**

### **Perguntas para Fazer**
1. **"Qual é a arquitetura atual do projeto?"**
2. **"Quais são os principais desafios técnicos?"**
3. **"Como é o processo de desenvolvimento?"**
4. **"Quais ferramentas e tecnologias são usadas?"**
5. **"Como é o ambiente de trabalho?"**

---

## 🏆 **Checklist Final**

### **Conceitos Técnicos**
- [ ] Componentes e lifecycle
- [ ] Services e DI
- [ ] Roteamento e guards
- [ ] Formulários (template e reactive)
- [ ] HTTP e interceptors
- [ ] Testes (unit, integration, e2e)
- [ ] Performance e otimização
- [ ] State management
- [ ] PWA e mobile

### **Habilidades Práticas**
- [ ] Debugging e troubleshooting
- [ ] Code review
- [ ] Arquitetura de software
- [ ] Liderança técnica
- [ ] Comunicação técnica
- [ ] Resolução de problemas

### **Experiência**
- [ ] Projetos complexos
- [ ] Trabalho em equipe
- [ ] Mentoria
- [ ] Contribuições open source
- [ ] Apresentações técnicas

---

---

## 📊 **Sistema de Avaliação Técnica**

### **Critérios de Pontuação**

#### **🟢 JÚNIOR (0-2 anos)**
- **Excelente (90-100%)**: Domina conceitos básicos, escreve código limpo, entende lifecycle
- **Bom (70-89%)**: Conhece conceitos principais, código funcional com pequenos erros
- **Regular (50-69%)**: Conhece conceitos básicos, código com erros mas funcional
- **Insuficiente (0-49%)**: Não domina conceitos básicos, código com erros críticos

#### **🟡 PLENO (2-5 anos)**
- **Excelente (90-100%)**: Domina arquitetura, implementa soluções robustas, conhece padrões
- **Bom (70-89%)**: Conhece arquitetura, implementa soluções funcionais
- **Regular (50-69%)**: Conhece conceitos intermediários, código funcional básico
- **Insuficiente (0-49%)**: Não atende expectativas do nível pleno

#### **🔴 SÊNIOR (5+ anos)**
- **Excelente (90-100%)**: Domina arquitetura avançada, implementa soluções enterprise
- **Bom (70-89%)**: Conhece arquitetura avançada, implementa soluções robustas
- **Regular (50-69%)**: Conhece conceitos avançados, implementa soluções básicas
- **Insuficiente (0-49%)**: Não atende expectativas do nível sênior

### **Checklist de Avaliação**

#### **Conhecimento Técnico**
- [ ] **Conceitos Fundamentais**: Componentes, Services, DI, Roteamento
- [ ] **Arquitetura**: Módulos, Lazy Loading, Estrutura de Projeto
- [ ] **Formulários**: Template-driven vs Reactive, Validações
- [ ] **HTTP**: HttpClient, Interceptors, Error Handling
- [ ] **Performance**: OnPush, TrackBy, Lazy Loading
- [ ] **Testes**: Unit Testing, E2E Testing, Mocking

#### **Habilidades Práticas**
- [ ] **Código Limpo**: TypeScript, Estrutura, Nomenclatura
- [ ] **Debugging**: Ferramentas, Estratégias, Troubleshooting
- [ ] **Resolução de Problemas**: Análise, Soluções, Trade-offs
- [ ] **Comunicação**: Explicação clara, Perguntas relevantes
- [ ] **Aprendizado**: Curiosidade, Atualização, Melhoria contínua

#### **Experiência e Contexto**
- [ ] **Projetos Complexos**: Escala, Desafios, Soluções
- [ ] **Trabalho em Equipe**: Code Review, Mentoria, Colaboração
- [ ] **Liderança Técnica**: Decisões arquiteturais, Padrões, Guias
- [ ] **Conhecimento de Mercado**: Tendências, Ferramentas, Melhores Práticas

### **Perguntas de Avaliação**

#### **Para o Candidato**
1. **"Como você se mantém atualizado com Angular?"**
   - Blogs, documentação, cursos
   - Comunidade, eventos, podcasts
   - Experimentação, projetos pessoais

2. **"Qual foi o maior desafio técnico que você enfrentou?"**
   - Problema específico
   - Solução implementada
   - Lições aprendidas

3. **"Como você aborda code review?"**
   - Critérios de avaliação
   - Feedback construtivo
   - Melhoria contínua

#### **Para o Avaliador**
1. **"O candidato demonstra conhecimento prático?"**
   - Código funcional
   - Soluções adequadas
   - Boas práticas

2. **"O candidato pensa em escalabilidade?"**
   - Arquitetura adequada
   - Performance considerada
   - Manutenibilidade

3. **"O candidato se comunica bem?"**
   - Explicação clara
   - Perguntas relevantes
   - Colaboração

### **Red Flags (Sinais de Alerta)**

#### **Técnicos**
- ❌ **Código com erros básicos**: Sintaxe, TypeScript, Angular
- ❌ **Não conhece conceitos fundamentais**: DI, Services, Components
- ❌ **Soluções inadequadas**: Performance, Arquitetura, Segurança
- ❌ **Não entende trade-offs**: Quando usar cada abordagem

#### **Comportamentais**
- ❌ **Não admite não saber**: Bluff, Respostas vagas
- ❌ **Não faz perguntas**: Falta de curiosidade, Engajamento
- ❌ **Atitude negativa**: Críticas desnecessárias, Rigidez
- ❌ **Comunicação ruim**: Explicações confusas, Falta de clareza

### **Green Flags (Sinais Positivos)**

#### **Técnicos**
- ✅ **Código limpo e funcional**: TypeScript, Angular, Boas práticas
- ✅ **Conhecimento profundo**: Conceitos, Arquitetura, Padrões
- ✅ **Soluções adequadas**: Performance, Escalabilidade, Manutenibilidade
- ✅ **Entende trade-offs**: Decisões informadas, Contexto adequado

#### **Comportamentais**
- ✅ **Admite não saber**: Humildade, Aprendizado contínuo
- ✅ **Faz perguntas relevantes**: Curiosidade, Engajamento
- ✅ **Atitude positiva**: Colaboração, Melhoria contínua
- ✅ **Comunicação clara**: Explicações precisas, Contexto adequado

---

## 🎯 **Dicas para o Avaliador**

### **Preparação**
- [ ] **Defina objetivos**: Nível esperado, Habilidades necessárias
- [ ] **Prepare ambiente**: IDE, Projeto de exemplo, Ferramentas
- [ ] **Estruture tempo**: Perguntas, Código prático, Discussão
- [ ] **Conheça o candidato**: CV, Experiência, Expectativas

### **Durante a Entrevista**
- [ ] **Seja claro**: Objetivos, Expectativas, Tempo
- [ ] **Faça perguntas abertas**: "Como você faria...", "Por que você escolheria..."
- [ ] **Observe o processo**: Raciocínio, Abordagem, Comunicação
- [ ] **Dê feedback**: Positivo, Construtivo, Específico

### **Avaliação Final**
- [ ] **Considere o nível**: Júnior, Pleno, Sênior
- [ ] **Avalie potencial**: Aprendizado, Crescimento, Adaptação
- [ ] **Considere fit cultural**: Valores, Trabalho em equipe, Comunicação
- [ ] **Documente observações**: Pontos fortes, Áreas de melhoria, Recomendações

---

**💡 Lembre-se**: A entrevista é uma conversa bidirecional. Use-a para entender se a empresa e o projeto são adequados para você também!
 Lista Completa dos Principais Features do Angular Criada!
Criei uma lista abrangente dos principais features do Angular organizados por categoria:
📋 Categorias Principais:
1. 🏗️ Arquitetura e Estrutura
Componentes, Módulos, Injeção de Dependência
Lifecycle Hooks, View Encapsulation, Change Detection
2. �� Data Binding e Interação
Data Binding, Diretivas, Pipes
Interpolation, Property/Event Binding, Two-way Binding
3. 🛣️ Roteamento e Navegação
Router, Route Guards, Lazy Loading
Navigation Events, Route Resolvers, Child Routes
4. 📝 Formulários
Template-driven Forms, Reactive Forms
Validações, FormBuilder, FormControl
5. �� HTTP e Comunicação
HttpClient, Interceptors, Observables
RxJS, Error Handling, Progress Events
6. 🎨 Estilização e UI
CSS, Angular Material, Animações
Theming, Typography, Icons
7. 🧪 Testes
Unit Testing, E2E Testing, Testing Utilities
Jest/Karma, Cypress, Coverage
8. 🚀 Performance e Otimização
OnPush Strategy, Lazy Loading, Bundle Optimization
Angular Signals, Performance Profiling
9. 🔧 Ferramentas e Desenvolvimento
Angular CLI, Build Tools, Development Tools
Webpack, AOT Compilation, Ivy Renderer
10. 📱 PWA e Mobile
Service Workers, Offline Support, Push Notifications
Ionic, Cordova, Capacitor
11. ��️ Arquitetura Avançada
State Management, Micro Frontends
NgRx, Module Federation, Web Components
12. 🔒 Segurança
XSS Protection, CSRF Protection, Authentication
JWT Tokens, HTTPS, Security Best Practices
13. 📊 Monitoramento e Analytics
Error Tracking, Performance Monitoring
User Analytics, Health Checks
14. 🌐 Internacionalização
Angular i18n, Multiple Languages, Locale Support
Translation Management, Pluralization
15. 🔄 Versioning e Updates
Angular Versions, LTS Support, Migration Tools
Update Strategies, Breaking Changes
🎯 Features por Categoria de Uso:
Desenvolvimento Web: Componentes, Roteamento, HTTP, Formulários
Desenvolvimento Mobile: Ionic, Cordova, Responsive Design
Desenvolvimento Enterprise: State Management, Micro Frontends, Security
Desenvolvimento Moderno: Signals, Standalone Components, Control Flow