# MFE Login - Integração com API

## ✅ Implementação Completa

O MFE de login foi atualizado para integrar com a API de autenticação JWT.

---

## 📋 O que foi Criado/Atualizado

### Backend (API)

#### 1. **Endpoint de Login** (`/v1/auth/login`)

**Arquivo:** `corporate-eda-app/apps/api/src/auth/auth.controller.ts`

```typescript
POST /v1/auth/login
Body: { email: string, password: string }
Response: {
  access_token: string,  // Token JWT
  user: {
    id: string,
    name: string,
    email: string,
    agencia: string,
    conta: string
  }
}
```

**Status:** ✅ Criado e configurado

#### 2. **AuthService** (`corporate-eda-app/apps/api/src/auth/auth.service.ts`)

- Valida credenciais (mock para desenvolvimento)
- Gera token JWT com payload contendo `agencia` e `conta`
- Retorna dados do usuário autenticado

**Credenciais de teste:**
- `admin@example.com` / `admin123` → agencia: `0001`, conta: `123456`
- `user@example.com` / `user123` → agencia: `1234`, conta: `567890`

#### 3. **DTOs** (`corporate-eda-app/apps/api/src/auth/dto/auth.dto.ts`)

- `LoginDto` - Validação de entrada
- `LoginResponseDto` - Resposta padronizada
- `UserResponseDto` - Dados do usuário

#### 4. **AuthModule** (`corporate-eda-app/apps/api/src/auth/auth.module.ts`)

- Módulo registrado no `AppModule`
- Endpoint marcado como `@Public()` (não requer autenticação)

---

### Frontend (MFE)

#### 1. **AuthService Atualizado** (`src/app/services/auth.service.ts`)

**Mudanças:**
- ✅ Integração com `HttpClient` para chamar API
- ✅ Método `login()` agora chama `POST /v1/auth/login`
- ✅ Fallback para mock se API não disponível (apenas em desenvolvimento)
- ✅ Armazena token JWT retornado pela API
- ✅ Extrai dados do usuário da resposta

**Código:**
```typescript
login(email: string, password: string): Observable<boolean> {
  return this.http.post<LoginResponse>(
    `${this.apiUrl}/v1/auth/login`,
    { email, password }
  ).pipe(
    map(response => {
      if (response.access_token) {
        const user: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: 'user',
          agencia: response.user.agencia,
          conta: response.user.conta,
        };
        this.setCurrentUser(user, response.access_token);
        return true;
      }
      return false;
    }),
    catchError(error => {
      // Fallback mock em desenvolvimento
      if (!environment.production && error.status === 0) {
        return this.loginMock(email, password);
      }
      return of(false);
    })
  );
}
```

#### 2. **LoginComponent Atualizado** (`src/app/features/auth/login/login.component.ts`)

**Melhorias:**
- ✅ Tratamento de erros mais detalhado
- ✅ Mensagens específicas para diferentes tipos de erro
- ✅ Verificação de conexão com API
- ✅ UI atualizada com título "Corporate EDA"

**Tratamento de erros:**
- `401` → "Credenciais inválidas"
- `0` (sem conexão) → "Erro de conexão. Verifique se a API está rodando."
- Outros → Mensagem de erro específica

---

## 🚀 Como Usar

### 1. Iniciar API

```bash
cd corporate-eda-app/apps/api
npm run start:dev
```

A API estará disponível em `http://localhost:3001`

### 2. Iniciar MFE

```bash
cd case-itau-front
ng serve
```

O MFE estará disponível em `http://localhost:4200`

### 3. Fazer Login

1. Acesse `http://localhost:4200/auth/login`
2. Use credenciais de teste:
   - **Admin:** `admin@example.com` / `admin123`
   - **User:** `user@example.com` / `user123`
3. Após login bem-sucedido, será redirecionado para `/home`

---

## 🔄 Fluxo de Autenticação

```
1. Usuário preenche email/senha no formulário
   ↓
2. LoginComponent chama AuthService.login()
   ↓
3. AuthService faz POST /v1/auth/login
   Body: { email, password }
   ↓
4. API valida credenciais e gera token JWT
   Response: { access_token, user: { id, name, email, agencia, conta } }
   ↓
5. AuthService armazena token no localStorage ('jwt_token')
   ↓
6. AuthService atualiza currentUser signal
   ↓
7. LoginComponent redireciona para /home (ou returnUrl)
   ↓
8. Interceptor HTTP adiciona "Authorization: Bearer <token>" em todas as requisições
   ↓
9. API extrai agencia/conta do token automaticamente
```

---

## 🧪 Testar Integração

### Teste 1: Login Bem-Sucedido

```bash
# Terminal 1: API
cd corporate-eda-app/apps/api
npm run start:dev

# Terminal 2: MFE
cd case-itau-front
ng serve

# Navegador
# 1. Acesse http://localhost:4200/auth/login
# 2. Preencha: user@example.com / user123
# 3. Clique em "Entrar"
# 4. Deve redirecionar para /home
# 5. Verifique localStorage: jwt_token deve estar presente
```

### Teste 2: Credenciais Inválidas

```bash
# No formulário de login
# Email: teste@example.com
# Senha: senha123
# Deve mostrar: "Credenciais inválidas"
```

### Teste 3: API Offline (Fallback Mock)

```bash
# 1. Pare a API (Ctrl+C)
# 2. Tente fazer login
# 3. Deve usar fallback mock e funcionar normalmente
# (apenas em desenvolvimento)
```

### Teste 4: Verificar Token no DevTools

```javascript
// Console do navegador
const token = localStorage.getItem('jwt_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
// Deve conter: { sub, agencia, conta, email, nome, iat, exp }
```

---

## 📊 Estrutura de Arquivos

### Backend

```
corporate-eda-app/apps/api/src/auth/
├── auth.controller.ts      # Endpoint POST /v1/auth/login
├── auth.service.ts         # Lógica de validação e geração de token
├── auth.module.ts          # Módulo de autenticação
└── dto/
    └── auth.dto.ts         # DTOs de request/response
```

### Frontend

```
case-itau-front/src/app/
├── services/
│   └── auth.service.ts     # Serviço atualizado com chamada à API
└── features/
    └── auth/
        └── login/
            ├── login.component.ts    # Componente atualizado
            ├── login.component.html  # Template
            └── login.component.scss  # Estilos
```

---

## 🔐 Segurança

### ✅ Implementado

1. **Validação de entrada:** DTOs com `class-validator`
2. **JWT seguro:** Token assinado com `JWT_SECRET`
3. **Expiração:** Tokens expiram em 1 hora (configurável)
4. **HTTPS:** Use em produção
5. **CORS:** Configurável via `CORS_ORIGINS`

### ⚠️ Produção

**Substituir validação mock:**

```typescript
// corporate-eda-app/apps/api/src/auth/auth.service.ts
async login(email: string, password: string): Promise<LoginResult | null> {
  // TODO: Substituir por consulta ao banco de dados
  const user = await this.userRepository.findByEmail(email);
  
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return null;
  }

  const payload: JwtPayload = {
    sub: user.id,
    agencia: user.agencia,
    conta: user.conta,
    email: user.email,
    nome: user.name,
  };

  const token = this.jwtService.sign(payload);
  return { token, user: { ...user } };
}
```

---

## 🐛 Troubleshooting

### Erro: "Erro de conexão"

**Causa:** API não está rodando ou CORS bloqueando

**Solução:**
1. Verificar se API está rodando: `curl http://localhost:3001/v1/health`
2. Verificar CORS na API: `CORS_ORIGINS=http://localhost:4200`
3. Verificar `environment.apiInvestimentos` no frontend

### Erro: "Credenciais inválidas" mesmo com credenciais corretas

**Causa:** API não está validando corretamente

**Solução:**
1. Verificar logs da API
2. Verificar se `AuthService.validateCredentials()` está correto
3. Testar endpoint diretamente:
```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

### Token não está sendo armazenado

**Causa:** Erro no `AuthService.setCurrentUser()`

**Solução:**
1. Verificar console do navegador para erros
2. Verificar se `response.access_token` está presente
3. Verificar localStorage no DevTools

---

## 📚 Documentação Relacionada

- `MFE-JWT-INTEGRATION.md` - Integração JWT completa
- `corporate-eda-app/apps/api/docs/AUTENTICACAO.md` - Documentação da API
- `corporate-eda-app/apps/api/docs/JWT-TESTING.md` - Como testar JWT

---

## ✨ Próximos Passos

1. **Implementar refresh token** para renovação automática
2. **Adicionar "Lembrar-me"** para persistir login
3. **Implementar logout** que invalida token no servidor (se necessário)
4. **Adicionar recuperação de senha**
5. **Migrar validação mock para banco de dados** em produção
