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
   - Framework baseado em TypeScript
   - Arquitetura de componentes
   - Sistema de módulos
   - CLI integrado

2. **Explique o ciclo de vida de um componente**
   - `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`
   - Quando usar cada hook
   - Diferenças entre hooks

3. **Como funciona o data binding no Angular?**
   - Interpolation: `{{ }}`
   - Property binding: `[property]="value"`
   - Event binding: `(event)="handler()"`
   - Two-way binding: `[(ngModel)]="value"`

4. **O que são diretivas e quais tipos existem?**
   - Structural: `*ngIf`, `*ngFor`, `*ngSwitch`
   - Attribute: `ngClass`, `ngStyle`
   - Custom directives

#### **Código Prático**
```typescript
// Crie um componente que exibe uma lista de usuários
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

### **🟡 PLENO (2-5 anos)**

#### **Arquitetura e Padrões**
1. **Explique a arquitetura de um projeto Angular**
   - Módulos e sua organização
   - Estrutura de pastas
   - Separação de responsabilidades
   - Lazy loading

2. **Como implementar comunicação entre componentes?**
   - `@Input()` e `@Output()`
   - Services para comunicação
   - EventEmitter
   - Subject/BehaviorSubject

3. **Diferenças entre Template-driven e Reactive Forms**
   - Quando usar cada um
   - Validações
   - Performance
   - Testabilidade

4. **Como implementar autenticação e autorização?**
   - Guards (CanActivate, CanLoad)
   - Interceptors
   - JWT tokens
   - Role-based access

#### **Código Prático**
```typescript
// Implemente um serviço de autenticação
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
}
```

### **🔴 SÊNIOR (5+ anos)**

#### **Arquitetura Avançada**
1. **Como implementar state management sem NgRx?**
   - Services com BehaviorSubject
   - Event-driven architecture
   - CQRS pattern
   - Event sourcing

2. **Estratégias de otimização de performance**
   - OnPush change detection
   - TrackBy functions
   - Lazy loading
   - Preloading strategies
   - Bundle optimization

3. **Como implementar micro frontends?**
   - Module Federation
   - Single-SPA
   - Web Components
   - Shared libraries

4. **Arquitetura de testes**
   - Test pyramid
   - Mocking strategies
   - E2E testing
   - Visual regression testing

#### **Código Prático**
```typescript
// Implemente um interceptor para tratamento de erros
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.router.navigate(['/forbidden']);
        } else if (error.status >= 500) {
          // Log error to monitoring service
          console.error('Server error:', error);
        }
        
        return throwError(error);
      })
    );
  }
}
```

---

## 🧪 **Desafios Práticos**

### **Desafio 1: CRUD com Validações**
```typescript
// Crie um formulário reativo para cadastro de produtos
// com validações customizadas e tratamento de erros
@Component({
  selector: 'app-product-form',
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Nome do produto">
      <div *ngIf="productForm.get('name')?.hasError('required')">
        Nome é obrigatório
      </div>
      
      <input formControlName="price" type="number" placeholder="Preço">
      <div *ngIf="productForm.get('price')?.hasError('min')">
        Preço deve ser maior que 0
      </div>
      
      <button type="submit" [disabled]="productForm.invalid">
        Salvar
      </button>
    </form>
  `
})
export class ProductFormComponent {
  productForm = this.fb.group({
    name: ['', [Validators.required, this.customValidator]],
    price: [0, [Validators.min(0.01)]],
    category: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  customValidator(control: AbstractControl): ValidationErrors | null {
    // Implementar validação customizada
    return null;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      // Implementar lógica de salvamento
    }
  }
}
```

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