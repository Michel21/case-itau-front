# 📋 Requisitos Detalhados - Sistema de Controle de Presença

**Contato**: Michel -  michelangelis1@hotmail.com

---

## 1. 🎯 Objetivo

Desenvolver uma **plataforma/aplicativo automatizado** para controle de presença dos adolescentes (faixa etária de 12 a 17 anos) nas programações semanais da igreja, de forma:
- ✅ **Rápida**
- ✅ **Intuitiva**
- ✅ **Independente de gerenciamento manual constante**

---

## 2. 📱 Necessidades Funcionais

### 2.1 Interface de Usuário

#### Características Principais:
- ✅ **Extremamente simples e intuitiva**, com mínimo tempo de interação
- ✅ **Funcionamento independente de uma única pessoa**
  - Não pode depender de mim somente
  - Tem que ser um aplicativo que os outros líderes mais velhos terão facilidade em aprender a usar

#### Requisitos de Usabilidade:
- Interface amigável para diferentes faixas etárias
- Tempo mínimo de treinamento
- Operação autônoma por múltiplos líderes
- Facilidade de uso para usuários menos experientes com tecnologia

---

### 2.2 Cadastro e Presença

#### 📝 Aba de Visitantes
**Campos obrigatórios:**
- Nome
- Idade
- Telefone

**Funcionalidade:**
- Formulário simples para registro rápido de novos visitantes

---

#### 👥 Aba de Membros Regulares
**Funcionalidade:**
- **Idealmente um único botão** para registrar presença (check-in automático)
- Processo simplificado ao máximo
- Um clique = presença registrada

**Armazenamento:**
- Contagem automatizada em planilhas ou banco de dados
- Histórico completo de presenças

**Identificação Prioritária:**
- Sistema deve **destacar automaticamente** cerca de 20 adolescentes específicos
- **Identificação visual clara** de quem veio e quem faltou
- Necessário para acompanhamento especial

---

### 2.3 ⚡ Acesso em Tempo Real

#### Requisitos Críticos:
- **Visualização ao vivo** da contagem de presença para controle de lanches
- **O acesso deve ser direto, rápido e sem complexidade**
- **Quem está na escala não pode perder tempo**

#### Casos de Uso:
- Líder responsável pelo lanche precisa saber quantas pessoas estão presentes
- Consulta rápida durante o evento
- Sem necessidade de login complexo ou navegação difícil

---

### 2.4 📅 Programações Específicas

#### Tipos de Eventos:

**1. Clube da Bíblia** (2 vezes ao mês)
- Contagem individual por evento
- Uma vez por mês no primeiro sábado do mês
- Tipo: Assim e Culto Teen

**2. Banda 1 e Banda 2** (Ensaios)
- **Presença separada para ensaios**
- Vinculada automaticamente à participação nos eventos regulares
- **É preciso que esses adolescentes apresentem presença em ambos** (ensaio e eventos)

#### Regras de Negócio:
- Sistema deve contabilizar presença em ensaios E eventos
- Relatórios devem mostrar frequência combinada
- Alertas para adolescentes que faltam em um dos dois

---

### 2.5 🔧 Manutenção

#### Requisitos:
- **Somente deve ser necessário adicionar visitantes ou novos membros**
- **Após configurado, o sistema não deverá exigir modificações semanais**
- Operação "set and forget"

#### Operações Permitidas:
- ✅ Adicionar novo adolescente
- ✅ Adicionar novo visitante
- ✅ Atualizar informações básicas
- ❌ NÃO requer configuração semanal
- ❌ NÃO requer ajustes constantes

---

## 3. 📊 Situação Atual

### Ferramentas em Uso:
- **Linktree + Google Forms**
- Formulários limpos semanalmente
- Dados enviados para planilhas manuais
- Organização precisa ser feita por evento e individualmente por membros da banda

### Problemas do Processo Atual:

#### ⏰ Processo Semanal Atual (Demorado):
1. **Habilitação e inibição semanal manual** de abas do Linktree (uma por programação)
2. **Coleta manual dos dados** dos formulários
3. **Organização manual** das planilhas
4. **Conferir manualmente os membros em destaque** (banda e mídia)

#### ❌ Pontos de Dor:
- Muito tempo gasto em tarefas repetitivas
- Dependência de uma pessoa para gerenciar
- Risco de erro humano
- Impossível acessar dados em tempo real durante evento
- Difícil visualizar quem está presente/ausente rapidamente

---

## 4. 🎯 Solução Proposta - Funcionalidades Essenciais

### 4.1 📱 Dashboard Principal (Tela Inicial)

```
┌─────────────────────────────────────────┐
│  🏠 Dashboard - [Data de Hoje]          │
├─────────────────────────────────────────┤
│                                         │
│  👥 Presentes Hoje: 45                  │
│  🍕 Lanches Necessários: 50             │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ ✅ REGISTRAR │  │ 👁️ VER LISTA │   │
│  │   PRESENÇA   │  │  COMPLETA    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  📊 Estatísticas Rápidas               │
│  ├─ Clube da Bíblia: 35/50             │
│  ├─ Banda 1: 8/10                      │
│  └─ Banda 2: 12/15                     │
└─────────────────────────────────────────┘
```

---

### 4.2 ✅ Tela de Registro de Presença

#### Para Membros Regulares:
```
┌─────────────────────────────────────────┐
│  ✅ Registrar Presença                  │
├─────────────────────────────────────────┤
│                                         │
│  🔍 Buscar: [____________]              │
│                                         │
│  📋 LISTA DE MEMBROS:                   │
│  ┌─────────────────────────────────┐  │
│  │ ⭐ João Silva          [✓] OK    │  │
│  │ ⭐ Maria Santos        [✓] OK    │  │
│  │    Pedro Costa        [ ] Click │  │
│  │ ⭐ Ana Oliveira       [✓] OK    │  │
│  │    Lucas Pereira      [ ] Click │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ⭐ = Membros em destaque (banda)       │
│  ✓ = Presença registrada               │
└─────────────────────────────────────────┘
```

#### Para Visitantes:
```
┌─────────────────────────────────────────┐
│  👋 Registrar Visitante                 │
├─────────────────────────────────────────┤
│                                         │
│  Nome: [____________________________]  │
│  Idade: [___]                          │
│  Telefone: [(__)_____-____]            │
│                                         │
│  [✅ SALVAR E REGISTRAR]                │
└─────────────────────────────────────────┘
```

---

### 4.3 📊 Visualização em Tempo Real

```
┌─────────────────────────────────────────┐
│  📊 Presença Ao Vivo                    │
├─────────────────────────────────────────┤
│  Evento: Culto Teen - 15/01/2025       │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  PRESENTES: 45 de 68 (66%)             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  🟢 PRESENTES (45)                      │
│  João, Maria, Pedro, Ana... [Ver Todos] │
│                                         │
│  🔴 AUSENTES (23)                       │
│  Lucas, Carla, Bruno... [Ver Todos]    │
│                                         │
│  ⭐ BANDA - STATUS:                     │
│  ├─ Banda 1: 7/10 ⚠️                   │
│  └─ Banda 2: 11/15 ✅                  │
│                                         │
│  🍕 LANCHES: Preparar 50 porções       │
└─────────────────────────────────────────┘
```

---

### 4.4 🎸 Controle Específico de Banda

```
┌─────────────────────────────────────────┐
│  🎸 Controle de Banda                   │
├─────────────────────────────────────────┤
│                                         │
│  📅 Semana Atual                        │
│  ├─ Ensaio: Quarta, 19h                │
│  └─ Evento: Domingo, 18h               │
│                                         │
│  BANDA 1 (Iniciante):                   │
│  ┌─────────────────────────────────┐  │
│  │ João   ✅ Ensaio  ✅ Evento     │  │
│  │ Maria  ✅ Ensaio  ❌ Evento     │  │
│  │ Pedro  ❌ Ensaio  ✅ Evento     │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ⚠️ ALERTAS:                            │
│  • Maria: Faltou no evento              │
│  • Pedro: Faltou no ensaio              │
│                                         │
│  [📊 VER RELATÓRIO MENSAL]              │
└─────────────────────────────────────────┘
```

---

## 5. 🔑 Funcionalidades Críticas (Must-Have)

### ✅ Essenciais (MVP):

1. **Registro Rápido de Presença**
   - Um clique para membros regulares
   - Formulário simples para visitantes
   - Sem login/senha para o registro básico

2. **Visualização em Tempo Real**
   - Contagem ao vivo de presentes
   - Cálculo automático de lanches
   - Acesso direto sem complicações

3. **Identificação de Membros em Destaque**
   - Marcação visual clara dos 20 adolescentes especiais
   - Status imediato (presente/ausente)
   - Lista separada para banda

4. **Controle de Eventos Específicos**
   - Clube da Bíblia (mensal)
   - Culto Teen
   - Ensaios de Banda 1 e 2

5. **Armazenamento Automático**
   - Dados salvos automaticamente
   - Histórico completo
   - Sem necessidade de exportar manualmente

6. **Baixa Manutenção**
   - Apenas adicionar novos membros/visitantes
   - Sem configuração semanal
   - Sistema auto-gerenciável

---

## 6. 🎨 Requisitos de Interface

### Princípios de Design:

1. **Simplicidade Extrema**
   - Máximo 2 cliques para qualquer ação
   - Botões grandes e claros
   - Texto legível (fonte ≥ 16px)

2. **Acesso Rápido**
   - Tela inicial mostra resumo imediato
   - Sem menus complexos
   - Navegação intuitiva

3. **Feedback Visual Claro**
   - ✅ Verde = Presente
   - ❌ Vermelho = Ausente
   - ⭐ Estrela = Membro em destaque
   - ⚠️ Amarelo = Atenção necessária

4. **Responsivo**
   - Funciona bem em celular (prioridade)
   - Funciona em tablet
   - Funciona em desktop

---

## 7. 📱 Fluxo de Uso Principal

### Cenário 1: Líder Registrando Presença no Início do Evento

```
1. Abre app no celular
2. Tela inicial já mostra lista de membros
3. Clica uma vez em cada nome presente
   └─ Botão fica verde ✅
4. Pronto! Dados salvos automaticamente
```

**Tempo estimado**: 2-3 minutos para 50 pessoas

---

### Cenário 2: Líder do Lanche Verificando Quantidade

```
1. Abre app
2. Vê imediatamente: "Presentes: 45"
3. Vê: "Lanches: 50 porções"
4. Fecha app
```

**Tempo estimado**: 5-10 segundos

---

### Cenário 3: Visitante Novo Chegando

```
1. Líder abre aba "Visitantes"
2. Preenche 3 campos (nome, idade, telefone)
3. Clica "Salvar"
4. Sistema registra automaticamente presença
```

**Tempo estimado**: 30-40 segundos

---

## 8. 📊 Relatórios Necessários

### 8.1 Relatório Semanal
- Total de presentes por evento
- Lista de ausentes
- Status da banda (ensaio + evento)

### 8.2 Relatório Mensal
- Frequência individual (%)
- Ranking de presença
- Visitantes novos
- Alertas de baixa frequência

### 8.3 Relatório de Banda
- Presença em ensaios
- Presença em eventos
- Combinação (precisa estar em ambos)
- Adolescentes com faltas

---

## 9. 🔐 Controle de Acesso

### Níveis de Usuário:

1. **Líder Principal (Admin)**
   - Acesso total
   - Gerencia outros líderes
   - Vê todos os relatórios

2. **Líderes (Moderadores)**
   - Registra presença
   - Vê listas em tempo real
   - Não pode deletar dados

3. **Visualização Apenas**
   - Vê presença em tempo real
   - Não pode registrar

---

## 10. 📲 Tecnologias Sugeridas

### Opção 1: Web App (PWA) - **RECOMENDADO**
```
Frontend: Next.js 14 + React
Backend: Next.js API Routes
Database: PostgreSQL (Supabase)
Autenticação: NextAuth.js
Deploy: Vercel (grátis)
```

**Vantagens:**
- ✅ Acesso de qualquer dispositivo
- ✅ Sem instalação necessária
- ✅ Funciona offline (PWA)
- ✅ Atualizações automáticas
- ✅ Custo baixo/grátis

---

### Opção 2: App Mobile Nativo
```
Framework: React Native + Expo
Backend: Firebase
```

**Vantagens:**
- ✅ Performance nativa
- ✅ Notificações push
- ❌ Requer instalação
- ❌ Custo mais alto

---

## 11. 🎯 Cronograma Sugerido

### Fase 1: MVP (2-3 semanas)
- ✅ Cadastro de membros e visitantes
- ✅ Registro de presença (um clique)
- ✅ Visualização em tempo real
- ✅ Lista de membros em destaque

### Fase 2: Funcionalidades Avançadas (1-2 semanas)
- ✅ Controle de banda (ensaio + evento)
- ✅ Eventos específicos (Clube da Bíblia)
- ✅ Cálculo automático de lanches

### Fase 3: Relatórios (1 semana)
- ✅ Relatório semanal
- ✅ Relatório mensal
- ✅ Exportação para PDF/Excel

### Fase 4: Polimento (1 semana)
- ✅ Testes com líderes
- ✅ Ajustes de usabilidade
- ✅ Treinamento

**Total**: 5-7 semanas

---

## 12. 💰 Estimativa de Custos

### Opção Gratuita (Recommended):
```
✅ Vercel (hosting): GRÁTIS
✅ Supabase (database): GRÁTIS (até 500MB)
✅ GitHub (código): GRÁTIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOTAL: R$ 0,00/mês
```

### Opção Paga (Maior Escala):
```
Vercel Pro: R$ 20/mês
PostgreSQL: R$ 7/mês (Render)
Domínio próprio: R$ 40/ano
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOTAL: ~R$ 30/mês
```

---

## 13. ✅ Checklist de Requisitos

### Interface:
- [ ] Extremamente simples e intuitiva
- [ ] Funciona sem depender de uma pessoa
- [ ] Fácil para líderes mais velhos
- [ ] Mínimo tempo de interação

### Cadastro:
- [ ] Visitantes: nome, idade, telefone
- [ ] Membros: um botão para presença
- [ ] Destaque de 20 adolescentes específicos
- [ ] Contagem automatizada

### Tempo Real:
- [ ] Visualização ao vivo
- [ ] Acesso direto e rápido
- [ ] Controle de lanches
- [ ] Sem complexidade

### Programações:
- [ ] Clube da Bíblia (mensal)
- [ ] Banda 1 e 2 (ensaios separados)
- [ ] Presença combinada (ensaio + evento)

### Manutenção:
- [ ] Apenas adicionar novos membros
- [ ] Sem modificações semanais
- [ ] Sistema auto-gerenciável

---

## 14. 📞 Próximos Passos

1. **Validar Requisitos**
   - Revisar este documento com Michel
   - Confirmar prioridades
   - Ajustar se necessário

2. **Protótipo Inicial**
   - Criar mockups da interface
   - Testar com 2-3 líderes
   - Coletar feedback

3. **Desenvolvimento MVP**
   - Implementar funcionalidades essenciais
   - Testar em ambiente real
   - Iterar baseado em feedback

4. **Treinamento**
   - Criar guia rápido de uso
   - Treinar líderes principais
   - Suporte inicial nas primeiras semanas

---

**Contato**:  michelangelis1@hotmail.com  
**Versão**: 1.0 - Baseado em requisitos manuscritos  
**Data**: 2025-01-11

