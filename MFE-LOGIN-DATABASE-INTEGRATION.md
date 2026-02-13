# MFE Login - Integração com Banco de Dados

## ✅ Implementação Completa

MFE de login criado seguindo o padrão do MFE Home e integrado com banco de dados PostgreSQL.

---

## 📋 O que foi Implementado

### Backend (API)

#### 1. **Tabela de Usuários** (`users`)

**Schema criado automaticamente:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  agencia VARCHAR(10) NOT NULL,
  conta VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Índices:**
- `idx_users_email` - Busca rápida por email
- `idx_users_agencia_conta` - Busca por agência/conta

#### 2. **UsersRepository** (`src/users/users.repository.ts`)

**Métodos:**
- `findByEmail(email)` - Busca usuário por email
- `findById(id)` - Busca usuário por ID
- `findByAgenciaConta(agencia, conta)` - Busca por agência/conta
- `create(data)` - Cria novo usuário

#### 3. **AuthService Atualizado**

**Mudanças:**
- ✅ Usa `UsersRepository` para consultar banco de dados
- ✅ Valida senha com `bcrypt.compare()`
- ✅ Gera token JWT com dados do banco
- ✅ Removida validação mock

**Código:**
```typescript
async login(email: string, password: string): Promise<LoginResult | null> {
  const userEntity = await this.usersRepository.findByEmail(email);
  
  if (!userEntity) return null;

  const isPasswordValid = await bcrypt.compare(password, userEntity.password_hash);
  if (!isPasswordValid) return null;

  const payload: JwtPayload = {
    sub: userEntity.id,
    agencia: userEntity.agencia,
    conta: userEntity.conta,
    email: userEntity.email,
    nome: userEntity.name,
  };

  const token = this.jwtService.sign(payload);
  return { token, user: { ... } };
}
```

#### 4. **Seed de Usuários**

**Criado automaticamente na inicialização:**
- `admin@example.com` / `admin123` → agencia: `0001`, conta: `123456`, role: `admin`
- `user@example.com` / `user123` → agencia: `1234`, conta: `567890`, role: `user`

**Senhas:** Hash bcrypt com salt rounds 10

---

### Frontend (MFE)

#### 1. **LoginComponent Atualizado** (seguindo padrão Home)

**Características do padrão Home:**
- ✅ Signals para estado reativo
- ✅ `ChangeDetectionStrategy.OnPush` para performance
- ✅ Computed signals para validação (`isFormValid`, `canSubmit`)
- ✅ Template moderno com `@if`/`@for`
- ✅ Estrutura de classes similar (`__header`, `__title`)

**Melhorias:**
- ✅ Validação em tempo real com computed signals
- ✅ Limpeza automática de erros ao digitar
- ✅ UI melhorada com ícones e estrutura similar ao home
- ✅ Botões de credenciais de teste melhorados

#### 2. **SCSS Atualizado**

**Seguindo padrão do Home:**
- ✅ Estrutura BEM-like (`login-header__title`)
- ✅ Gradientes e cores consistentes
- ✅ Animações e transições suaves
- ✅ Responsivo

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único (PK) |
| `email` | VARCHAR(255) | Email único (UNIQUE) |
| `password_hash` | VARCHAR(255) | Hash bcrypt da senha |
| `name` | VARCHAR(255) | Nome do usuário |
| `agencia` | VARCHAR(10) | Agência bancária |
| `conta` | VARCHAR(20) | Conta bancária |
| `role` | VARCHAR(20) | Role (user/admin) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

### Seed Automático

Usuários criados automaticamente na primeira inicialização:

```sql
-- Admin
INSERT INTO users (email, password_hash, name, agencia, conta, role)
VALUES ('admin@example.com', '<bcrypt_hash>', 'Admin User', '0001', '123456', 'admin');

-- User
INSERT INTO users (email, password_hash, name, agencia, conta, role)
VALUES ('user@example.com', '<bcrypt_hash>', 'Regular User', '1234', '567890', 'user');
```

---

## 🚀 Como Usar

### 1. Iniciar PostgreSQL

```bash
# Via docker-compose (raiz do projeto)
cd corporate-eda-app
docker-compose up -d postgres
```

### 2. Iniciar API

```bash
cd corporate-eda-app/apps/api
npm run start:dev
```

**A API irá:**
- Conectar ao PostgreSQL
- Criar tabela `users` automaticamente
- Criar seed de usuários (se tabela estiver vazia)

### 3. Iniciar MFE

```bash
cd case-itau-front
ng serve
```

### 4. Fazer Login

1. Acesse `http://localhost:4200/auth/login`
2. Use credenciais do banco:
   - **Admin:** `admin@example.com` / `admin123`
   - **User:** `user@example.com` / `user123`
3. Após login → redireciona para `/home`

---

## 🔄 Fluxo Completo

```
1. Usuário preenche email/senha
   ↓
2. LoginComponent valida com computed signals
   ↓
3. AuthService.login() → POST /v1/auth/login
   ↓
4. API: UsersRepository.findByEmail(email)
   ↓
5. API: bcrypt.compare(password, userEntity.password_hash)
   ↓
6. API: Gera token JWT com dados do banco
   ↓
7. Response: { access_token, user: { id, name, email, agencia, conta } }
   ↓
8. Frontend: Armazena token e redireciona para /home
   ↓
9. Interceptor adiciona Bearer token automaticamente
   ↓
10. API extrai agencia/conta do token em todas as requisições
```

---

## 📊 Comparação: Padrão Home vs Login

### Home Component

```typescript
// Signals
private readonly catsSignal = signal<ICatsTypes[]>([]);
private readonly loadingSignal = signal<boolean>(false);

// Computed
public readonly filteredCats = computed(() => { ... });

// ChangeDetectionStrategy.OnPush
changeDetection: ChangeDetectionStrategy.OnPush
```

### Login Component (seguindo padrão)

```typescript
// Signals
public readonly email = signal<string>('');
public readonly password = signal<string>('');
public readonly isLoading = signal<boolean>(false);

// Computed
public readonly isFormValid = computed(() => { ... });
public readonly canSubmit = computed(() => { ... });

// ChangeDetectionStrategy.OnPush
changeDetection: ChangeDetectionStrategy.OnPush
```

---

## 🧪 Testar Integração

### 1. Verificar Tabela no Banco

```bash
# Conectar ao PostgreSQL
psql -h localhost -U postgres -d corporate_eda

# Verificar usuários
SELECT id, email, name, agencia, conta, role FROM users;
```

### 2. Testar Login via API

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Regular User",
    "email": "user@example.com",
    "agencia": "1234",
    "conta": "567890"
  }
}
```

### 3. Testar Login no MFE

1. Acesse `http://localhost:4200/auth/login`
2. Preencha credenciais
3. Verifique no DevTools > Network:
   - Request: `POST /v1/auth/login`
   - Response: Token JWT + dados do usuário
4. Verifique localStorage: `jwt_token` deve estar presente

---

## 🔐 Segurança

### ✅ Implementado

1. **Senhas hasheadas:** bcrypt com salt rounds 10
2. **Validação no banco:** Consulta real ao PostgreSQL
3. **JWT seguro:** Token assinado com `JWT_SECRET`
4. **Validação de entrada:** DTOs com `class-validator`

### ⚠️ Produção

**Recomendações:**
1. **Rate limiting:** Limitar tentativas de login (ex.: 5/min por IP)
2. **Auditoria:** Log de tentativas de login (sucesso/falha)
3. **Senha forte:** Validar complexidade no frontend/backend
4. **2FA:** Implementar autenticação de dois fatores
5. **Refresh tokens:** Para renovação sem re-login

---

## 📁 Arquivos Criados/Modificados

### Backend

- ✅ `apps/api/src/database/database.service.ts` (atualizado - tabela users)
- ✅ `apps/api/src/users/users.repository.ts` (novo)
- ✅ `apps/api/src/users/users.module.ts` (novo)
- ✅ `apps/api/src/auth/auth.service.ts` (atualizado - usa banco)
- ✅ `apps/api/src/auth/auth.module.ts` (atualizado - importa UsersModule)

### Frontend

- ✅ `src/app/features/auth/login/login.component.ts` (atualizado - padrão home)
- ✅ `src/app/features/auth/login/login.component.html` (atualizado - estrutura similar)
- ✅ `src/app/features/auth/login/login.component.scss` (atualizado - padrão home)

---

## 🎨 Padrão Visual (seguindo Home)

### Estrutura de Classes

**Home:**
```scss
.listContainer {
  &__header {
    &__title { ... }
    &__search { ... }
  }
}
```

**Login (seguindo padrão):**
```scss
.login-container {
  .login-card {
    .login-header {
      &__title { ... }
    }
  }
  .test-credentials {
    &__header { ... }
  }
}
```

### Cores e Gradientes

- **Background:** `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
- **Título:** `linear-gradient(45deg, #667eea 0%, #764ba2 100%)`
- **Botão:** `linear-gradient(45deg, #667eea 0%, #764ba2 100%)`

---

## ✨ Diferenciais do Padrão Home

1. **Performance:** Signals + OnPush = menos re-renders
2. **Reatividade:** Computed signals atualizam automaticamente
3. **Validação:** Em tempo real com computed signals
4. **UX:** Feedback visual imediato
5. **Código limpo:** Estrutura consistente e organizada

---

## 📚 Documentação Relacionada

- `MFE-LOGIN-API-INTEGRATION.md` - Integração com API
- `MFE-JWT-INTEGRATION.md` - Integração JWT completa
- `corporate-eda-app/apps/api/docs/AUTENTICACAO.md` - Doc da API

---

## 🐛 Troubleshooting

### Erro: "relation users does not exist"

**Causa:** Tabela não foi criada

**Solução:**
1. Verificar logs da API na inicialização
2. Verificar conexão com PostgreSQL
3. Reiniciar API para executar schema

### Erro: "password does not match"

**Causa:** Hash bcrypt incorreto ou senha errada

**Solução:**
1. Verificar seed de usuários no banco
2. Verificar se senha está correta
3. Recriar usuário com hash correto

### Erro: "Cannot find module 'bcrypt'"

**Causa:** bcrypt não instalado

**Solução:**
```bash
cd corporate-eda-app/apps/api
npm install bcrypt @types/bcrypt --legacy-peer-deps
```

---

**Pronto para uso!** 🎉 O MFE de login está integrado com banco de dados e segue o padrão do MFE Home.
