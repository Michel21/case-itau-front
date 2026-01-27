#!/bin/bash

# 🎓 Script de Setup - Plataforma de Controle de Presença
# Ajustado com base em REQUISITOS-DETALHADOS-PRESENCA.md
# 
# Principais ajustes:
# - Modelo Visitante simplificado (nome, idade, telefone)
# - Campo emDestaque para ~20 adolescentes da banda
# - Tipos de eventos específicos (Clube da Bíblia, Culto Teen, Ensaios)
# - TipoPresenca (ENSAIO vs EVENTO) para controle de banda
# - Estrutura de pastas otimizada para acesso rápido
# - PWA para funcionamento offline
#
# Autor: Sistema Automatizado
# Data: 2025-01-11
# Contato: Michel -  michelangelis1@hotmail.com

set -e

# Diretório base onde o projeto será criado
BASE_DIR="/Users/michelangelisaraujo"
cd "$BASE_DIR"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🎓 Plataforma de Controle de Presença - Setup Automático       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Local de instalação: $BASE_DIR"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_NAME="plataforma-presenca"

# Função para exibir etapas
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Criar projeto Next.js
print_step "1/10 Criando projeto Next.js 14 com TypeScript..."
echo "no" | npx create-next-app@latest $PROJECT_NAME \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --no-git || true

cd $PROJECT_NAME
print_success "Projeto Next.js criado!"

# 2. Instalar dependências principais
print_step "2/10 Instalando dependências principais..."
npm install @prisma/client @auth/prisma-adapter next-auth@beta
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-label @radix-ui/react-slot
npm install @radix-ui/react-switch @radix-ui/react-checkbox
npm install recharts date-fns lucide-react
npm install clsx tailwind-merge class-variance-authority
npm install qrcode react-qr-code qrcode.react
npm install nodemailer
npm install bcryptjs
npm install @tanstack/react-table
npm install next-pwa workbox-window
npm install sonner # Toasts simples e rápidos
print_success "Dependências principais instaladas!"

# 3. Instalar dependências de desenvolvimento
print_step "3/10 Instalando dependências de desenvolvimento..."
npm install -D prisma @types/node
npm install -D @types/bcryptjs @types/nodemailer
npm install -D @types/qrcode
npm install -D tsx
print_success "Dependências de desenvolvimento instaladas!"

# 4. Inicializar Prisma
print_step "4/10 Inicializando Prisma ORM..."
npx prisma init
print_success "Prisma inicializado!"

# 5. Criar estrutura de pastas
print_step "5/10 Criando estrutura de pastas..."
# Estrutura baseada nos requisitos específicos
mkdir -p src/app/{auth,dashboard}/{login,register}
mkdir -p src/app/dashboard/presenca/{registro,tempo-real,banda}
mkdir -p src/app/dashboard/{visitantes,membros,eventos,relatorios}
mkdir -p src/components/{ui,forms,tables,charts,shared,presenca}
mkdir -p src/components/presenca/{registro-rapido,tempo-real,banda-status}
mkdir -p src/lib/{actions,validations,utils}
mkdir -p src/types
mkdir -p prisma/migrations
mkdir -p public/images
print_success "Estrutura de pastas criada!"

# 6. Criar arquivo .env
print_step "6/10 Criando arquivo .env..."
cat > .env <<EOL
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/presenca_db?schema=public"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Email (opcional)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@example.com"
EOL
print_success "Arquivo .env criado!"

# 7. Criar docker-compose.yml
print_step "7/10 Criando docker-compose.yml..."
cat > docker-compose.yml <<EOL
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: presenca_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: presenca_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOL
print_success "docker-compose.yml criado!"

# 8. Criar Prisma Schema
print_step "8/10 Criando Prisma schema..."
cat > prisma/schema.prisma <<'EOL'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTENTICAÇÃO
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(INSTRUTOR)
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// ADOLESCENTES E RESPONSÁVEIS
// ============================================

model Adolescente {
  id             String      @id @default(cuid())
  nome           String
  dataNascimento DateTime
  cpf            String      @unique
  rg             String?
  foto           String?
  telefone       String?
  email          String?
  endereco       String?
  cidade         String?
  estado         String?
  cep            String?
  observacoes    String?     @db.Text
  ativo          Boolean     @default(true)
  
  // CAMPO CRÍTICO: Marcar membros em destaque (banda ~20 adolescentes)
  emDestaque     Boolean     @default(false) // ⭐ Para banda/mídia
  banda          TipoBanda?  // BANDA_1, BANDA_2, ou null
  
  responsavelId  String?
  responsavel    Responsavel? @relation(fields: [responsavelId], references: [id])
  
  presencas      Presenca[]
  visitas        VisitantePresenca[] @relation("AdolescenteVisitantes")
  
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([emDestaque])
  @@index([banda])
  @@map("adolescentes")
}

model Responsavel {
  id           String        @id @default(cuid())
  nome         String
  cpf          String        @unique
  rg           String?
  telefone     String
  email        String        @unique
  endereco     String?
  cidade       String?
  estado       String?
  cep          String?
  parentesco   String        // Pai, Mãe, Avô, Tio, etc.
  observacoes  String?       @db.Text
  
  adolescentes Adolescente[]
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("responsaveis")
}

// ============================================
// VISITANTES (Formulário Simplificado)
// ============================================

model Visitante {
  id            String      @id @default(cuid())
  nome          String      // Campo obrigatório 1
  idade         Int         // Campo obrigatório 2
  telefone      String      // Campo obrigatório 3
  observacoes   String?     @db.Text
  
  presencas     VisitantePresenca[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("visitantes")
}

// ============================================
// EVENTOS ESPECÍFICOS
// ============================================

model Evento {
  id          String         @id @default(cuid())
  nome        String         // Ex: "Clube da Bíblia", "Culto Teen", "Ensaio Banda 1"
  tipo        TipoEvento
  descricao   String?        @db.Text
  dataEvento  DateTime
  horario     String?        // Ex: "18:00 - 20:00"
  ativo       Boolean        @default(true)
  
  presencas          Presenca[]           @relation("EventoPresencas")
  presencasVisitantes VisitantePresenca[] @relation("EventoVisitantes")
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([dataEvento])
  @@index([tipo])
  @@map("eventos")
}

// ============================================
// PRESENÇA DE MEMBROS REGULARES
// ============================================

model Presenca {
  id            String          @id @default(cuid())
  adolescenteId String
  adolescente   Adolescente     @relation(fields: [adolescenteId], references: [id], onDelete: Cascade)
  
  eventoId      String?
  evento        Evento?         @relation("EventoPresencas", fields: [eventoId], references: [id])
  
  // Tipo de presença: ENSAIO ou EVENTO (crítico para banda)
  tipoPresenca  TipoPresenca    @default(EVENTO)
  
  data          DateTime        @default(now())
  checkIn       DateTime        @default(now())
  checkOut      DateTime?
  status        StatusPresenca  @default(PRESENTE)
  observacao    String?         @db.Text
  justificativa String?         @db.Text
  
  registradoPor String?         // Nome do líder/coordenador
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([adolescenteId])
  @@index([data])
  @@index([tipoPresenca])
  @@index([eventoId])
  @@map("presencas")
}

// ============================================
// PRESENÇA DE VISITANTES
// ============================================

model VisitantePresenca {
  id            String          @id @default(cuid())
  visitanteId   String?
  visitante     Visitante?      @relation(fields: [visitanteId], references: [id], onDelete: Cascade)
  
  // Visitante pode ser também um adolescente (conversão)
  adolescenteId String?
  adolescente   Adolescente?    @relation("AdolescenteVisitantes", fields: [adolescenteId], references: [id], onDelete: Cascade)
  
  eventoId      String?
  evento        Evento?         @relation("EventoVisitantes", fields: [eventoId], references: [id])
  
  data          DateTime        @default(now())
  checkIn       DateTime        @default(now())
  observacao    String?         @db.Text
  
  registradoPor String?
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([visitanteId])
  @@index([data])
  @@index([eventoId])
  @@map("visitantes_presencas")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  COORDENADOR
  INSTRUTOR
  VISUALIZACAO // Apenas visualização (sem registro)
}

enum StatusPresenca {
  PRESENTE
  AUSENTE
  JUSTIFICADO
  ATRASADO
}

enum TipoPresenca {
  ENSAIO   // Ensaio de banda
  EVENTO   // Evento regular (Culto Teen, Clube da Bíblia)
}

enum TipoEvento {
  CLUBE_BIBLIA    // 2x por mês, primeiro sábado
  CULTO_TEEN      // Evento regular
  ENSAIO_BANDA_1  // Ensaio Banda 1 (iniciantes)
  ENSAIO_BANDA_2  // Ensaio Banda 2 (avançados)
  OUTRO
}

enum TipoBanda {
  BANDA_1  // Banda iniciante
  BANDA_2  // Banda avançada
}
EOL
print_success "Prisma schema criado (ajustado para requisitos específicos)!"

# 9. Criar package.json scripts adicionais
print_step "9/10 Adicionando scripts ao package.json..."
npm pkg set scripts.db:push="prisma db push"
npm pkg set scripts.db:migrate="prisma migrate dev"
npm pkg set scripts.db:seed="prisma db seed"
npm pkg set scripts.db:studio="prisma studio"
npm pkg set scripts.db:reset="prisma migrate reset"
npm pkg set scripts.docker:up="docker-compose up -d"
npm pkg set scripts.docker:down="docker-compose down"
npm pkg set scripts.docker:logs="docker-compose logs -f"
print_success "Scripts adicionados!"

# 10. Mensagem final
print_step "10/10 Finalizando setup..."
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Setup concluído com sucesso!                                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Projeto criado em: $PROJECT_NAME/"
echo ""
echo "🎯 AJUSTES BASEADOS NOS REQUISITOS ESPECÍFICOS:"
echo ""
echo "✅ Estrutura de pastas ajustada:"
echo "   • /presenca/registro - Registro rápido (1 clique)"
echo "   • /presenca/tempo-real - Visualização ao vivo"
echo "   • /presenca/banda - Controle específico de banda"
echo "   • /visitantes - Cadastro simplificado (3 campos)"
echo ""
echo "✅ Schema Prisma ajustado:"
echo "   • Modelo Visitante (nome, idade, telefone)"
echo "   • Campo emDestaque para ~20 adolescentes da banda"
echo "   • TipoPresenca (ENSAIO vs EVENTO)"
echo "   • TipoEvento (Clube da Bíblia, Culto Teen, Ensaios)"
echo "   • TipoBanda (BANDA_1, BANDA_2)"
echo "   • Role VISUALIZACAO (acesso rápido sem login complexo)"
echo ""
echo "✅ Dependências adicionadas:"
echo "   • next-pwa (Progressive Web App)"
echo "   • sonner (notificações rápidas)"
echo "   • Componentes Radix adicionais"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Entre na pasta do projeto:"
echo "   cd $PROJECT_NAME"
echo ""
echo "2. Inicie o PostgreSQL com Docker:"
echo "   npm run docker:up"
echo ""
echo "3. Execute as migrações do banco:"
echo "   npm run db:push"
echo ""
echo "4. (Opcional) Adicione dados de teste:"
echo "   npm run db:seed"
echo ""
echo "5. Inicie o servidor de desenvolvimento:"
echo "   npm run dev"
echo ""
echo "6. Abra no navegador:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentação completa:"
echo "   • PLATAFORMA-PRESENCA-README.md (técnico)"
echo "   • REQUISITOS-DETALHADOS-PRESENCA.md (especificações)"
echo ""
print_success "Sistema pronto para desenvolvimento! 🚀"

