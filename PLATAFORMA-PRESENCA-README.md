# 🎓 Plataforma de Controle de Presença - Adolescentes (12-17 anos)

## 📋 Visão Geral

Sistema automatizado para controle de presença de adolescentes em instituições educacionais, ONGs, ou centros comunitários, desenvolvido com **Next.js 14**, **TypeScript**, **Prisma ORM**, e **PostgreSQL**.

---

## 🎯 Funcionalidades Principais

### 👥 Gestão de Usuários
- ✅ Cadastro de adolescentes (12-17 anos)
- ✅ Cadastro de responsáveis legais
- ✅ Cadastro de instrutores/coordenadores
- ✅ Autenticação e autorização (NextAuth.js)
- ✅ Perfis com foto e informações de contato

### 📊 Controle de Presença
- ✅ Registro rápido de presença (QR Code ou manual)
- ✅ Check-in e check-out com timestamp
- ✅ Histórico completo de presenças
- ✅ Registro de justificativas de ausência
- ✅ Controle por turma/atividade

### 📈 Dashboard e Relatórios
- ✅ Dashboard em tempo real
- ✅ Estatísticas de frequência por adolescente
- ✅ Relatórios por período (diário, semanal, mensal)
- ✅ Gráficos interativos
- ✅ Exportação para PDF e Excel

### 🔔 Notificações
- ✅ Alertas de ausência prolongada
- ✅ Notificações para responsáveis
- ✅ Lembretes de atividades
- ✅ Emails automáticos

### ♿ Acessibilidade
- ✅ WCAG 2.1 AA compliant
- ✅ Navegação por teclado
- ✅ Leitores de tela (NVDA, VoiceOver)
- ✅ Alto contraste
- ✅ Textos redimensionáveis

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** 5.x
- **React 18** (Server Components)
- **Tailwind CSS** 3.x
- **Shadcn/ui** (componentes acessíveis)
- **Recharts** (gráficos)
- **React Hook Form** + **Zod** (validação)

### Backend
- **Next.js API Routes** (Edge Runtime)
- **Prisma ORM** 5.x
- **PostgreSQL** 15+
- **NextAuth.js** (autenticação)
- **Nodemailer** (emails)

### DevOps
- **Docker** + **Docker Compose**
- **Vercel** (deployment)
- **GitHub Actions** (CI/CD)

---

## 📁 Estrutura do Projeto

```
plataforma-presenca/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Grupo de rotas protegidas
│   │   ├── adolescentes/         # CRUD de adolescentes
│   │   ├── responsaveis/         # CRUD de responsáveis
│   │   ├── presenca/             # Registro de presença
│   │   ├── relatorios/           # Relatórios e exportação
│   │   ├── dashboard/            # Dashboard principal
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── adolescentes/
│   │   ├── presenca/
│   │   └── relatorios/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Shadcn/ui components
│   ├── forms/                    # Formulários
│   ├── tables/                   # Tabelas de dados
│   ├── charts/                   # Gráficos
│   └── shared/                   # Componentes compartilhados
├── lib/                          # Utilities e configurações
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── validations.ts            # Schemas Zod
│   └── utils.ts                  # Funções utilitárias
├── prisma/                       # Database schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                       # Assets estáticos
├── styles/                       # Estilos globais
├── types/                        # TypeScript types
├── docker-compose.yml            # Docker setup
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm/yarn/pnpm
- PostgreSQL 15+ ou Docker
- Git

### 1. Criar o projeto

```bash
# Criar projeto Next.js com TypeScript
npx create-next-app@latest plataforma-presenca --typescript --tailwind --app --eslint

cd plataforma-presenca
```

### 2. Instalar dependências

```bash
# Dependências principais
npm install @prisma/client @next-auth/prisma-adapter next-auth
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install recharts date-fns lucide-react
npm install clsx tailwind-merge class-variance-authority

# Dependências de desenvolvimento
npm install -D prisma @types/node
npm install -D @types/react @types/react-dom
```

### 3. Configurar banco de dados

```bash
# Inicializar Prisma
npx prisma init

# Configurar .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/presenca_db"
NEXTAUTH_SECRET="seu_secret_aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Docker (opcional)

```bash
# Iniciar PostgreSQL com Docker
docker-compose up -d

# Rodar migrações
npx prisma migrate dev --name init

# Seed do banco (dados de teste)
npx prisma db seed
```

### 5. Executar o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

Acesse: **http://localhost:3000**

---

## 📊 Modelo de Dados (Prisma Schema)

### Principais Entidades

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          UserRole
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Adolescente {
  id            String    @id @default(cuid())
  nome          String
  dataNascimento DateTime
  cpf           String    @unique
  foto          String?
  telefone      String?
  email         String?
  endereco      String?
  responsavelId String
  responsavel   Responsavel @relation(...)
  presencas     Presenca[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Responsavel {
  id            String    @id @default(cuid())
  nome          String
  cpf           String    @unique
  telefone      String
  email         String    @unique
  adolescentes  Adolescente[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Presenca {
  id            String    @id @default(cuid())
  adolescenteId String
  adolescente   Adolescente @relation(...)
  data          DateTime  @default(now())
  checkIn       DateTime
  checkOut      DateTime?
  status        StatusPresenca
  observacao    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  INSTRUTOR
  COORDENADOR
}

enum StatusPresenca {
  PRESENTE
  AUSENTE
  JUSTIFICADO
  ATRASADO
}
```

---

## 🎨 Design System

### Cores Principais
- **Primary**: #3b82f6 (Blue 500)
- **Secondary**: #8b5cf6 (Violet 500)
- **Success**: #22c55e (Green 500)
- **Warning**: #f59e0b (Amber 500)
- **Error**: #ef4444 (Red 500)
- **Background**: #ffffff
- **Text**: #1f2937

### Componentes Base (Shadcn/ui)
- Button
- Input
- Select
- Dialog
- Table
- Card
- Badge
- Avatar
- Tabs
- Alert

---

## 🔐 Segurança

### Autenticação
- ✅ NextAuth.js com sessões JWT
- ✅ Refresh tokens
- ✅ OAuth (Google, GitHub)
- ✅ Two-factor authentication (2FA)

### Autorização
- ✅ Role-based access control (RBAC)
- ✅ Middleware de proteção de rotas
- ✅ API routes protegidas

### Dados Sensíveis
- ✅ Encriptação de senhas (bcrypt)
- ✅ HTTPS obrigatório em produção
- ✅ Sanitização de inputs
- ✅ Rate limiting

---

## 📱 Responsividade

- ✅ Mobile First
- ✅ Breakpoints: 640px, 768px, 1024px, 1280px
- ✅ Touch-friendly (44x44px mínimo)
- ✅ PWA (Progressive Web App)

---

## 🧪 Testes

```bash
# Testes unitários (Jest)
npm run test

# Testes E2E (Playwright)
npm run test:e2e

# Cobertura
npm run test:coverage
```

---

## 📚 Documentação da API

### Endpoints Principais

#### Adolescentes
- `GET /api/adolescentes` - Listar todos
- `POST /api/adolescentes` - Criar novo
- `GET /api/adolescentes/[id]` - Buscar por ID
- `PUT /api/adolescentes/[id]` - Atualizar
- `DELETE /api/adolescentes/[id]` - Deletar

#### Presença
- `POST /api/presenca/check-in` - Registrar entrada
- `POST /api/presenca/check-out` - Registrar saída
- `GET /api/presenca/historico/[adolescenteId]` - Histórico

#### Relatórios
- `GET /api/relatorios/frequencia` - Relatório de frequência
- `GET /api/relatorios/export/pdf` - Exportar PDF
- `GET /api/relatorios/export/excel` - Exportar Excel

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build da imagem
docker build -t plataforma-presenca .

# Executar container
docker run -p 3000:3000 plataforma-presenca
```

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📞 Contato

- **Desenvolvedor**: Seu Nome
- **Email**: seu@email.com
- **LinkedIn**: linkedin.com/in/seu-perfil

---

**Versão**: 1.0.0  
**Data**: 2025-01-11  
**Status**: 🚀 Em Desenvolvimento

