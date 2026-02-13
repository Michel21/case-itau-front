# Estratégia Profissional: Compartilhamento de Token entre MFEs

## 🎯 Visão Geral

Este documento descreve as melhores estratégias profissionais para compartilhar tokens JWT entre Micro Frontends (MFEs) em uma arquitetura moderna.

---

## 📊 Comparação de Estratégias

| Estratégia | Complexidade | Performance | Segurança | Cross-Origin | Recomendação |
|------------|--------------|-------------|-----------|--------------|--------------|
| **1. AuthStoreService (Signals)** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ **Recomendado** |
| **2. BroadcastChannel API** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Excelente |
| **3. Custom Events** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ✅ Simples |
| **4. PostMessage API** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Cross-origin |
| **5. Module Federation** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Avançado |
| **6. Shared State (Redux/Zustand)** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Alternativa |

---

## 🏆 Estratégia Recomendada: AuthStoreService + BroadcastChannel

### Por que esta estratégia?

1. ✅ **Single Source of Truth:** Estado centralizado
2. ✅ **Reatividade:** Signals do Angular 17+
3. ✅ **Cross-Tab:** BroadcastChannel sincroniza entre abas
4. ✅ **Cross-Origin:** PostMessage para MFEs diferentes
5. ✅ **Performance:** Signals são otimizados
6. ✅ **Manutenibilidade:** Código limpo e testável

---

## 🏗️ Arquitetura Implementada

### Camada 1: AuthStoreService (Core)

**Responsabilidade:** Single Source of Truth para autenticação

```typescript
@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  // Signals reativos
  public readonly token = signal<string | null>(null);
  public readonly user = signal<User | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  
  // Computed: validação de token
  public readonly isValidToken = computed(() => { ... });
  
  // Sincronização automática com AuthService
  // Sincronização cross-tab via localStorage events
}
```

**Vantagens:**
- ✅ Estado centralizado e reativo
- ✅ Sincronização automática
- ✅ Compatível com Signals do Angular

### Camada 2: CrossMfeAuthService (Comunicação)

**Responsabilidade:** Comunicação entre MFEs

```typescript
@Injectable({ providedIn: 'root' })
export class CrossMfeAuthService {
  // BroadcastChannel (cross-tab)
  // Custom Events (mesma origem)
  // PostMessage (cross-origin)
  
  publishLogin(token, user) { ... }
  publishLogout() { ... }
}
```

**Vantagens:**
- ✅ Suporta múltiplas estratégias
- ✅ Fallback automático
- ✅ Cross-origin ready

### Camada 3: Interceptor HTTP (Uso)

**Responsabilidade:** Adicionar token automaticamente

```typescript
export function ApiInterceptor(req, next) {
  const authStore = inject(AuthStoreService);
  const token = authStore.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
}
```

**Vantagens:**
- ✅ Automático em todas as requisições
- ✅ Usa AuthStoreService (fonte única)
- ✅ Transparente para componentes

---

## 🔄 Fluxo Completo

### Cenário 1: MFE Login → MFE Home (Mesma Aplicação)

```
1. Usuário faz login no MFE Login
   ↓
2. AuthService.login() → API retorna token
   ↓
3. AuthService armazena token no localStorage
   ↓
4. AuthStoreService detecta mudança (effect)
   ↓
5. AuthStoreService atualiza signals
   ↓
6. CrossMfeAuthService.publishLogin() → BroadcastChannel
   ↓
7. MFE Home escuta evento → atualiza estado
   ↓
8. Interceptor HTTP usa token automaticamente
```

### Cenário 2: MFE Login → MFE Home (Cross-Origin)

```
1. MFE Login (app1.com) → Login bem-sucedido
   ↓
2. CrossMfeAuthService.publishLogin() → PostMessage
   ↓
3. MFE Home (app2.com) recebe PostMessage
   ↓
4. Valida origem (em produção)
   ↓
5. Atualiza AuthStoreService
   ↓
6. Token disponível para requisições
```

### Cenário 3: Múltiplas Abas

```
1. Usuário faz login na Aba 1
   ↓
2. Token armazenado no localStorage
   ↓
3. BroadcastChannel envia evento
   ↓
4. Aba 2 recebe evento → atualiza estado
   ↓
5. Ambas as abas sincronizadas
```

---

## 💻 Implementação

### 1. Atualizar AuthService para usar AuthStoreService

```typescript
// src/app/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private authStore: AuthStoreService, // Injetar store
    private crossMfe: CrossMfeAuthService // Injetar comunicação
  ) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/v1/auth/login`, { email, password })
      .pipe(
        map(response => {
          if (response.access_token) {
            const user = { ...response.user };
            this.setCurrentUser(user, response.access_token);
            
            // Publicar evento para outros MFEs
            this.crossMfe.publishLogin(response.access_token, user);
            
            return true;
          }
          return false;
        })
      );
  }
}
```

### 2. Atualizar Interceptor para usar AuthStoreService

```typescript
// src/app/security/api.interceptor.ts
export function ApiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authStore = inject(AuthStoreService); // Usar store em vez de AuthService
  
  const token = authStore.getToken();
  const headers: { [key: string]: string } = {};
  
  if (urlConfig.x_api_key) {
    headers['x-api-key'] = urlConfig.x_api_key;
  }
  
  if (token && authStore.isValidToken()) { // Validar expiração
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const apiRequest = req.clone({ setHeaders: headers });
  return next(apiRequest);
}
```

### 3. Usar no MFE Home

```typescript
// src/app/features/home/home.component.ts
export class HomeComponent {
  private readonly authStore = inject(AuthStoreService);
  
  // Usar signals do store
  public readonly user = this.authStore.user;
  public readonly isAuthenticated = this.authStore.isAuthenticated;
  
  ngOnInit() {
    // Reatividade automática
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        console.log('Usuário autenticado:', this.authStore.getCurrentUser());
      }
    });
  }
}
```

---

## 🔐 Segurança

### ✅ Boas Práticas Implementadas

1. **Validação de Token:**
   - Verifica expiração (`isValidToken` computed)
   - Remove token expirado automaticamente

2. **Cross-Origin:**
   - Valida origem em PostMessage (produção)
   - Whitelist de origens permitidas

3. **Storage:**
   - Token apenas no localStorage (não sessionStorage)
   - Não armazena dados sensíveis além do necessário

4. **HTTPS:**
   - Use sempre em produção
   - Evita interceptação de tokens

### ⚠️ Recomendações Adicionais

1. **Refresh Tokens:**
   ```typescript
   // Implementar renovação automática antes de expirar
   if (tokenExpiresIn < 5 * 60) { // 5 minutos
     refreshToken();
   }
   ```

2. **Token Rotation:**
   ```typescript
   // Rotacionar token periodicamente
   rotateTokenEvery(15 * 60); // 15 minutos
   ```

3. **Secure Cookies (Alternativa):**
   ```typescript
   // Para maior segurança, usar HttpOnly cookies
   // Requer backend para definir cookie
   ```

---

## 🎯 Cenários de Uso

### Cenário A: MFEs Standalone (Recomendado para este projeto)

**Arquitetura:**
- MFE Login: standalone app
- MFE Home: standalone app
- Compartilhamento via AuthStoreService + BroadcastChannel

**Vantagens:**
- ✅ Simples de implementar
- ✅ Não requer Module Federation
- ✅ Funciona cross-tab
- ✅ Performance excelente

### Cenário B: Module Federation

**Arquitetura:**
- Shell App: gerencia autenticação
- MFEs: consomem módulo compartilhado
- Compartilhamento via shared module

**Vantagens:**
- ✅ Estado verdadeiramente compartilhado
- ✅ TypeScript compartilhado
- ✅ Bundle otimizado

**Implementação:**
```typescript
// webpack.config.js (Shell)
new ModuleFederationPlugin({
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    './auth-store': { singleton: true }, // Módulo compartilhado
  }
})
```

### Cenário C: Cross-Origin (Diferentes Domínios)

**Arquitetura:**
- MFE Login: `login.app.com`
- MFE Home: `home.app.com`
- Compartilhamento via PostMessage + CORS

**Implementação:**
```typescript
// login.app.com
window.postMessage({
  type: 'corporate-eda-auth',
  payload: { token, user }
}, 'https://home.app.com'); // Origem específica

// home.app.com
window.addEventListener('message', (event) => {
  if (event.origin === 'https://login.app.com') {
    // Processar token
  }
});
```

---

## 📈 Performance

### Otimizações Implementadas

1. **Signals (Angular 17+):**
   - Reatividade granular
   - Menos re-renders
   - Computed memoization

2. **Lazy Loading:**
   - AuthStoreService carregado apenas quando necessário
   - Interceptor registrado globalmente (uma vez)

3. **Caching:**
   - Token em memória (signal)
   - localStorage como backup
   - Validação de expiração em computed

### Métricas Esperadas

- **Latência de sincronização:** < 10ms (mesma origem)
- **Overhead de interceptor:** < 1ms por requisição
- **Memória:** ~5KB por instância

---

## 🧪 Testes

### Teste 1: Sincronização Cross-Tab

```typescript
// Aba 1
authService.login('user@example.com', 'user123').subscribe();

// Aba 2 (deve receber automaticamente)
expect(authStore.isAuthenticated()).toBe(true);
```

### Teste 2: Validação de Token

```typescript
// Token expirado
const expiredToken = generateExpiredToken();
authStore.tokenSignal.set(expiredToken);

expect(authStore.isValidToken()).toBe(false);
```

### Teste 3: Cross-Origin

```typescript
// Simular PostMessage
window.postMessage({
  type: 'corporate-eda-auth',
  payload: { token: 'test', user: {...} }
}, '*');

// Verificar se token foi atualizado
expect(authStore.getToken()).toBe('test');
```

---

## 📚 Referências

### Documentação Oficial

- [Angular Signals](https://angular.dev/guide/signals)
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [PostMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)

### Padrões de Arquitetura

- **Single Source of Truth:** Redux Pattern
- **Observer Pattern:** Signals do Angular
- **Pub/Sub:** BroadcastChannel e Custom Events
- **Cross-Origin Communication:** PostMessage

---

## 🚀 Próximos Passos

1. **Implementar Refresh Token:**
   - Renovação automática antes de expirar
   - Endpoint `/v1/auth/refresh`

2. **Adicionar Métricas:**
   - Tempo de sincronização
   - Taxa de falhas de autenticação

3. **Implementar Rate Limiting:**
   - Limitar tentativas de login
   - Proteção contra brute force

4. **Adicionar Logging:**
   - Auditoria de acessos
   - Log de eventos de autenticação

---

## ✅ Checklist de Implementação

- [x] AuthStoreService criado
- [x] CrossMfeAuthService criado
- [x] Interceptor atualizado
- [ ] AuthService integrado com store
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Documentação de uso
- [ ] Exemplos de código

---

**Estratégia recomendada:** **AuthStoreService + BroadcastChannel** para máxima compatibilidade e performance.
