# Integração MFE com Autenticação JWT

## Mudanças Implementadas

### 1. AuthService Atualizado (`src/app/services/auth.service.ts`)

**Novas funcionalidades:**
- ✅ Suporte a JWT com payload contendo `agencia` e `conta`
- ✅ Geração de token mock para testes
- ✅ Decodificação e validação de expiração de tokens
- ✅ Armazenamento seguro do token no localStorage

**Interface User atualizada:**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  agencia: string;  // NOVO
  conta: string;    // NOVO
}
```

**Credenciais de teste:**
```typescript
// Admin: agencia: 0001, conta: 123456
email: 'admin@example.com'
password: 'admin123'

// User: agencia: 1234, conta: 567890
email: 'user@example.com'
password: 'user123'
```

### 2. Interceptor HTTP Atualizado (`src/app/security/api.interceptor.ts`)

**Mudanças:**
- ✅ Adiciona automaticamente `Authorization: Bearer <token>` em todas as requisições
- ✅ Extrai token do `AuthService` via `inject()`
- ✅ Mantém compatibilidade com `x-api-key` existente

### 3. Novo Serviço de Investimentos (`src/app/services/investimentos.service.ts`)

**Métodos disponíveis:**
- `obterProdutos()` - Lista produtos de investimento
- `obterSaldo()` - Saldo consolidado
- `obterExtrato()` - Extrato paginado
- `obterPosicao()` - Posição consolidada
- `investir()` - Processar investimento

**IMPORTANTE:** Agência e conta **NÃO** são enviadas nos payloads. São extraídas automaticamente do token JWT pela API.

### 4. Environment Configurado (`src/environments/environment.ts`)

```typescript
export const environment = {
  // ... existente
  apiInvestimentos: 'http://localhost:3001'
};
```

---

## Como Usar

### 1. Login

```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

login() {
  this.authService.login('user@example.com', 'user123').subscribe(success => {
    if (success) {
      // Login bem-sucedido
      // Token JWT armazenado automaticamente
      // User contém: { id, name, email, role, agencia, conta }
      const user = this.authService.currentUser();
      console.log('Logado como:', user);
    }
  });
}
```

### 2. Usar Serviço de Investimentos

```typescript
import { InvestimentosService } from './services/investimentos.service';

constructor(private investimentos: InvestimentosService) {}

carregarProdutos() {
  // Agência e conta vêm automaticamente do token JWT
  this.investimentos.obterProdutos('CDB', '01/2024', '12/2024')
    .subscribe(response => {
      if (response.success) {
        const produtos = response.data;
        console.log('Produtos:', produtos);
      }
    });
}

investir() {
  // Agência e conta vêm automaticamente do token JWT
  this.investimentos.investir('389', 1000, 'conta-corrente')
    .subscribe(response => {
      if (response.success) {
        console.log('Investimento realizado:', response.data);
      }
    });
}

// Com idempotência (retry seguro)
investirComIdempotencia() {
  const idempotencyKey = `investimento-${Date.now()}`;
  
  this.investimentos.investir('389', 1000, 'conta-corrente', idempotencyKey)
    .subscribe(response => {
      // Se houver erro de rede e fazer retry com mesma chave,
      // a API retorna o mesmo resultado sem duplicar o investimento
    });
}
```

### 3. Verificar Autenticação em Componentes

```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

ngOnInit() {
  // Observable
  this.authService.isAuthenticated$.subscribe(isAuth => {
    console.log('Autenticado:', isAuth);
  });

  // Signal (readonly)
  const user = this.authService.currentUser();
  if (user) {
    console.log(`Agência: ${user.agencia}, Conta: ${user.conta}`);
  }
}
```

---

## Fluxo de Autenticação

```
1. Usuário faz login
   ↓
2. AuthService gera token JWT mock (ou recebe do servidor)
   Token contém: { sub, agencia, conta, email, nome, exp }
   ↓
3. Token armazenado no localStorage ('jwt_token')
   ↓
4. Interceptor adiciona "Authorization: Bearer <token>" em TODAS as requisições
   ↓
5. API valida token e extrai agencia/conta automaticamente
   ↓
6. API processa requisição com dados do usuário autenticado
```

---

## Exemplo Completo: Componente de Investimentos

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { InvestimentosService, ProdutoInvestimento } from './services/investimentos.service';

@Component({
  selector: 'app-investimentos',
  template: `
    <div *ngIf="user">
      <h2>Bem-vindo, {{ user.name }}</h2>
      <p>Agência: {{ user.agencia }} | Conta: {{ user.conta }}</p>
      
      <button (click)="carregarProdutos()">Carregar Produtos</button>
      <button (click)="investir()">Investir R$ 1.000</button>
      <button (click)="logout()">Sair</button>
      
      <ul>
        <li *ngFor="let produto of produtos">
          {{ produto.nome }} - R$ {{ produto.valorAtual }}
        </li>
      </ul>
    </div>
  `
})
export class InvestimentosComponent implements OnInit {
  user = this.authService.currentUser();
  produtos: ProdutoInvestimento[] = [];

  constructor(
    private authService: AuthService,
    private investimentos: InvestimentosService
  ) {}

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    // NÃO precisa passar agencia/conta - vêm do token
    this.investimentos.obterProdutos('CDB', '01/2024', '12/2024')
      .subscribe(response => {
        if (response.success) {
          this.produtos = response.data;
        }
      });
  }

  investir() {
    // NÃO precisa passar agencia/conta - vêm do token
    const idempotencyKey = `inv-${Date.now()}`;
    
    this.investimentos.investir('389', 1000, 'conta-corrente', idempotencyKey)
      .subscribe({
        next: response => {
          if (response.success) {
            alert(`Sucesso: ${response.data.mensagem}`);
            this.carregarProdutos(); // Recarregar lista
          }
        },
        error: err => {
          if (err.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            this.authService.logout();
          }
        }
      });
  }

  logout() {
    this.authService.logout();
  }
}
```

---

## Tratamento de Erros

### 401 Unauthorized

```typescript
this.investimentos.obterSaldo('CDB').subscribe({
  next: response => { /* sucesso */ },
  error: err => {
    if (err.status === 401) {
      // Token inválido ou expirado
      console.error('Não autenticado');
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
});
```

### Interceptor Global de Erros

```typescript
// src/app/security/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
```

---

## Configuração do App

Certifique-se de que os interceptors estão registrados:

```typescript
// app.config.ts ou main.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiInterceptor } from './app/security/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([ApiInterceptor])
    ),
    // ... outros providers
  ]
};
```

---

## Checklist de Migração

- [x] AuthService atualizado com suporte a JWT
- [x] Interface User inclui `agencia` e `conta`
- [x] Interceptor adiciona `Authorization: Bearer <token>`
- [x] InvestimentosService criado
- [x] Métodos **NÃO** enviam `agencia`/`conta` no payload
- [x] Environment configurado com `apiInvestimentos`
- [ ] Componentes migrados para usar novo InvestimentosService
- [ ] Testes ajustados para novos payloads
- [ ] Guards de rota verificam autenticação
- [ ] Tratamento de erro 401 (logout automático)

---

## Diferenças do Serviço Antigo

### Antes (NestJS refatorado)

```typescript
await this.service.obterProdutos({
  tipoInvestimento: 'CDB',
  agencia: '1234',  // ❌ Enviava no payload
  conta: '567890',  // ❌ Enviava no payload
  dataInicio: '01/2024',
  dataFim: '12/2024'
});
```

### Agora (JWT)

```typescript
this.investimentos.obterProdutos('CDB', '01/2024', '12/2024')
  .subscribe(response => {
    // ✅ agencia/conta vêm do token JWT automaticamente
    const produtos = response.data;
  });
```

---

## Testes

### 1. Testar Login

```bash
# No console do navegador:
// Login
authService.login('user@example.com', 'user123').subscribe(success => {
  console.log('Login:', success);
  console.log('Token:', localStorage.getItem('jwt_token'));
  console.log('User:', authService.currentUser());
});
```

### 2. Testar Chamada à API

```bash
# Abrir DevTools > Network
# Fazer login
# Chamar investimentos.obterSaldo('CDB')
# Verificar request headers:
#   - Authorization: Bearer eyJhbG...
#   - Body: { "tipoInvestimento": "CDB" } (sem agencia/conta)
```

### 3. Testar Token Expirado

```bash
# Modificar token no localStorage com exp passado
# Fazer requisição
# Deve retornar 401 e fazer logout
```

---

## Produção

Em produção, substituir a geração mock de tokens por chamada real ao serviço de autenticação:

```typescript
login(email: string, password: string): Observable<boolean> {
  return this.http.post<{ token: string }>('/api/auth/login', { email, password })
    .pipe(
      map(response => {
        const payload = this.decodeToken(response.token);
        if (payload) {
          const user = this.payloadToUser(payload);
          this.setCurrentUser(user, response.token);
          return true;
        }
        return false;
      })
    );
}
```

---

## Troubleshooting

### Token não está sendo enviado

Verificar:
1. AuthService.getToken() retorna o token
2. Interceptor está registrado em app.config
3. localStorage contém 'jwt_token'

### 401 mesmo com token válido

Verificar:
1. `JWT_SECRET` no backend é o mesmo usado para gerar o token
2. Token não expirou (campo `exp`)
3. Token contém `agencia` e `conta` no payload

### CORS bloqueando requisições

Configurar no backend (API):
```bash
CORS_ORIGINS=http://localhost:4200
```
