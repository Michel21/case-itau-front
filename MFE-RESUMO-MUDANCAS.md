# Resumo das Mudanças no MFE - Integração JWT

## 📋 Arquivos Modificados

### 1. `src/app/services/auth.service.ts`
**Status:** ✅ Atualizado

**Mudanças:**
- Adicionado suporte a JWT com payload contendo `agencia` e `conta`
- Interface `User` expandida com campos `agencia` e `conta`
- Métodos de decodificação e validação de tokens
- Geração de tokens mock para desenvolvimento/testes
- Método `getToken()` para uso pelo interceptor

**Código antes:**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
```

**Código depois:**
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

---

### 2. `src/app/security/api.interceptor.ts`
**Status:** ✅ Atualizado

**Mudanças:**
- Injeção do `AuthService` via `inject()`
- Adição automática do header `Authorization: Bearer <token>`
- Mantém compatibilidade com `x-api-key` existente

**Código antes:**
```typescript
export function ApiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const apiRequest = req.clone({ 
    setHeaders: { 'x-api-key': urlConfig.x_api_key } 
  });
  return next(apiRequest);
}
```

**Código depois:**
```typescript
export function ApiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  const headers: { [key: string]: string } = {};
  if (urlConfig.x_api_key) headers['x-api-key'] = urlConfig.x_api_key;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const apiRequest = req.clone({ setHeaders: headers });
  return next(apiRequest);
}
```

---

### 3. `src/app/services/investimentos.service.ts`
**Status:** ✅ Criado (novo arquivo)

**Funcionalidades:**
- 5 métodos principais: `obterProdutos`, `obterSaldo`, `obterExtrato`, `obterPosicao`, `investir`
- **IMPORTANTE:** Nenhum método envia `agencia` ou `conta` no payload
- Suporte a idempotência no método `investir` (header `X-Idempotency-Key`)
- Interfaces TypeScript completas para todas as respostas

**Exemplo de uso:**
```typescript
// ❌ ANTES (serviço refatorado)
this.service.obterSaldo({
  tipoInvestimento: 'CDB',
  agencia: '1234',
  conta: '567890'
});

// ✅ AGORA (JWT)
this.investimentos.obterSaldo('CDB')
  // agencia e conta vêm do token JWT automaticamente
```

---

### 4. `src/environments/environment.ts`
**Status:** ✅ Atualizado

**Mudanças:**
- Adicionada propriedade `apiInvestimentos: 'http://localhost:3001'`

**Código antes:**
```typescript
export const environment = {
  production: false,
  api: 'https://api.thecatapi.com/v1/breeds',
  x_api_key: '...'
};
```

**Código depois:**
```typescript
export const environment = {
  production: false,
  api: 'https://api.thecatapi.com/v1/breeds',
  x_api_key: '...',
  apiInvestimentos: 'http://localhost:3001'  // NOVO
};
```

---

### 5. `src/environments/environment.prod.ts`
**Status:** ✅ Atualizado

**Mudanças:**
- Adicionada configuração para produção

---

### 6. `MFE-JWT-INTEGRATION.md`
**Status:** ✅ Criado (documentação completa)

**Conteúdo:**
- Guia de uso dos novos serviços
- Exemplos de código
- Fluxo de autenticação
- Tratamento de erros
- Checklist de migração

---

## 🔑 Principais Diferenças

### Segurança

**Antes:**
- Agência e conta enviadas em **todo** request (body/headers)
- Risco de manipulação de dados
- Impossível garantir que usuário está acessando própria conta

**Agora:**
- Agência e conta no **token JWT** (criptografado)
- API extrai automaticamente do token
- Usuário só acessa próprios dados
- Impossível manipular agência/conta

### Payload das Requisições

**Antes:**
```json
POST /v1/extratos/investimentos/investir
{
  "produtoId": "389",
  "valor": 1000,
  "origemRecurso": "conta-corrente",
  "agencia": "1234",
  "conta": "567890"
}
```

**Agora:**
```json
POST /v1/extratos/investimentos/investir
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "produtoId": "389",
  "valor": 1000,
  "origemRecurso": "conta-corrente"
}
```

### Headers das Requisições

**Antes:**
```
x-api-key: live_...
x-pdpj-agencia: 1234
x-pdpj-conta: 567890
```

**Agora:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: live_... (mantido para outras APIs)
```

---

## 🧪 Como Testar

### 1. Fazer Login

```typescript
// No componente ou DevTools
this.authService.login('user@example.com', 'user123').subscribe(success => {
  if (success) {
    const user = this.authService.currentUser();
    console.log('User:', user);
    // Output: { id: '2', agencia: '1234', conta: '567890', ... }
  }
});
```

### 2. Verificar Token

```typescript
// DevTools Console
const token = localStorage.getItem('jwt_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// Output: { sub: '2', agencia: '1234', conta: '567890', ... }
```

### 3. Chamar API de Investimentos

```typescript
this.investimentos.obterSaldo('CDB').subscribe(response => {
  console.log('Saldo:', response.data);
});

// DevTools > Network:
// Request Headers: Authorization: Bearer eyJ...
// Request Payload: { "tipoInvestimento": "CDB" }
// (sem agencia/conta)
```

---

## 📝 Checklist de Integração

### Backend (API)
- [x] JWT authentication implementada
- [x] Guard JWT aplicado globalmente
- [x] Endpoints extraem agencia/conta do token
- [x] DTOs sem campos agencia/conta
- [x] Documentação atualizada

### Frontend (MFE)
- [x] AuthService com suporte a JWT
- [x] Interceptor adiciona Bearer token
- [x] InvestimentosService criado
- [x] Métodos **não** enviam agencia/conta
- [x] Environment configurado
- [x] Documentação criada
- [ ] Guards de rota atualizados (se necessário)
- [ ] Componentes migrados para novo serviço
- [ ] Testes atualizados

---

## 🚀 Próximos Passos

1. **Iniciar API:**
```bash
cd corporate-eda-app/apps/api
npm run start:dev
```

2. **Iniciar MFE:**
```bash
cd case-itau-front
ng serve
```

3. **Testar Fluxo Completo:**
   - Acessar `http://localhost:4200`
   - Fazer login (user@example.com / user123)
   - Injetar `InvestimentosService` em algum componente
   - Chamar métodos de investimentos
   - Verificar no Network que agencia/conta não são enviadas
   - Verificar que API retorna dados corretos

4. **Migrar Componentes Existentes:**
   - Substituir chamadas diretas à API
   - Usar `InvestimentosService`
   - Remover lógica de envio de agencia/conta

---

## 🔐 Credenciais de Teste

### Admin
- Email: `admin@example.com`
- Senha: `admin123`
- Agência: `0001`
- Conta: `123456`

### User
- Email: `user@example.com`
- Senha: `user123`
- Agência: `1234`
- Conta: `567890`

---

## 📚 Documentação Adicional

- `MFE-JWT-INTEGRATION.md` - Guia completo de uso
- `corporate-eda-app/apps/api/docs/AUTENTICACAO.md` - Documentação da API
- `corporate-eda-app/apps/api/docs/JWT-TESTING.md` - Como testar JWT na API

---

## ⚠️ Avisos Importantes

1. **Tokens Mock:** Os tokens gerados pelo `AuthService.login()` são **mock** para desenvolvimento. Em produção, substituir por chamada real ao serviço de autenticação.

2. **CORS:** Configurar `CORS_ORIGINS` na API:
```bash
CORS_ORIGINS=http://localhost:4200
```

3. **JWT_SECRET:** Em produção, usar secret forte e armazenar em vault/secrets manager.

4. **Expiração:** Tokens expiram em 1 hora. Implementar refresh token se necessário.

5. **Logout:** Ao fazer logout, o token é removido do localStorage mas **não** é invalidado no servidor (stateless JWT). Para invalidação completa, implementar blacklist no backend.
