# Correções de Acessibilidade - Período Mobile

## 🐛 Problema Identificado

### Sintoma
Leitores de tela anunciavam "grupo" ao navegar por elementos textuais:
```
"É possível consultar lançamentos dos últimos 12 meses., grupo"
```

### Causa Raiz

#### 1. `<section>` com `role="presentation"` (INCORRETO)
```html
<!-- ❌ ANTES: Ainda cria contexto de grupo -->
<section class="intro" role="presentation">
  <h2 class="intro__title" tabindex="0" role="text">
    Para visualizar o extrato,<br>escolha o período
  </h2>
  <p class="intro__subtitle" tabindex="0" role="text">
    É possível consultar lançamentos dos<br>últimos 12 meses.
  </p>
</section>
```

**Problemas:**
- `role="presentation"` não remove completamente a semântica de agrupamento
- `tabindex="0"` torna elementos não interativos focáveis
- `role="text"` é redundante em `<h2>` e `<p>`
- Leitores de tela ainda detectam `<section>` como "grupo"

#### 2. `<main>` com `role="none"` (INCORRETO)
```html
<!-- ❌ ANTES: Remove landmark importante -->
<main class="content" role="none" aria-label="...">
```

**Problema:**
- Remove landmark importante para navegação
- `role="none"` cancela o `role="main"` nativo

#### 3. `<h1>` com `role="heading"` redundante
```html
<!-- ❌ ANTES: role redundante -->
<h1 class="header__title" tabindex="0" role="heading">Investimentos</h1>
```

**Problema:**
- `role="heading"` é redundante (já é um `<h1>`)
- `tabindex="0"` desnecessário para títulos

## ✅ Solução Implementada

### 1. Remover Semântica de Agrupamento Corretamente
```html
<!-- ✅ DEPOIS: Remove completamente o "grupo" -->
<section class="intro" role="none" aria-hidden="true">
  <h2 class="intro__title">
    Para visualizar o extrato,<br>escolha o período
  </h2>
  <p class="intro__subtitle">
    É possível consultar lançamentos dos<br>últimos 12 meses.
  </p>
</section>
```

**Benefícios:**
- `role="none"` + `aria-hidden="true"` = Completamente ignorado
- Sem `tabindex="0"` = Não focável desnecessariamente
- Sem `role="text"` = Semântica nativa preservada
- **Resultado:** Nenhum anúncio de "grupo"

### 2. Manter Landmark do `<main>`
```html
<!-- ✅ DEPOIS: Landmark preservado -->
<main class="content" role="main" aria-label="Seleção de período para visualização de extrato">
```

**Benefícios:**
- Landmark `main` preservado para navegação
- `aria-label` descritivo para contexto

### 3. Simplificar `<h1>`
```html
<!-- ✅ DEPOIS: Semântica nativa -->
<h1 class="header__title">Investimentos</h1>
```

**Benefícios:**
- Semântica nativa de heading preservada
- Sem atributos redundantes

## 📊 Comparação: Antes vs Depois

### Antes (Com "grupo")
```
Narração:
1. "Para visualizar o extrato, escolha o período, heading nível 2"
2. "É possível consultar lançamentos dos últimos 12 meses., grupo"
                                                                 ^^^^^ INDESEJADO
```

### Depois (Sem "grupo")
```
Narração:
1. (Seção completamente ignorada por aria-hidden="true")
2. Usuário vai direto para controles interativos (Toggle, Inputs, Botão)
```

## 🎯 Princípios Aplicados

### 1. Use `role="none"` + `aria-hidden="true"` para Conteúdo Puramente Visual
```html
<!-- Conteúdo que não precisa ser narrado -->
<div role="none" aria-hidden="true">
  Decoração ou texto visual redundante
</div>
```

### 2. Não Use `role="presentation"` em Containers
```html
<!-- ❌ EVITAR: Não funciona bem em <section>, <div>, <form> -->
<section role="presentation">...</section>

<!-- ✅ USAR: role="none" é mais consistente -->
<section role="none" aria-hidden="true">...</section>
```

### 3. Não Adicione `tabindex="0"` em Elementos Não Interativos
```html
<!-- ❌ EVITAR: Títulos e parágrafos não precisam ser focáveis -->
<h2 tabindex="0">Título</h2>
<p tabindex="0">Parágrafo</p>

<!-- ✅ USAR: Semântica nativa -->
<h2>Título</h2>
<p>Parágrafo</p>
```

### 4. Não Use Roles Redundantes
```html
<!-- ❌ EVITAR: role já é implícito -->
<h1 role="heading">Título</h1>
<button role="button">Botão</button>
<main role="main">Conteúdo</main>

<!-- ✅ USAR: Semântica nativa -->
<h1>Título</h1>
<button>Botão</button>
<main>Conteúdo</main>
```

## 🧪 Como Testar

### 1. Com Leitor de Tela
```bash
# NVDA (Windows)
1. Iniciar NVDA
2. Abrir aplicação
3. Navegar com Tab
4. Verificar que NÃO anuncia "grupo"

# VoiceOver (macOS)
1. Cmd + F5 para ativar
2. Ctrl + Option + Setas para navegar
3. Verificar que NÃO anuncia "grupo"
```

### 2. Com DevTools
```javascript
// No console do navegador
const section = document.querySelector('.intro');
console.log('Role:', section.getAttribute('role')); // "none"
console.log('Aria-hidden:', section.getAttribute('aria-hidden')); // "true"
console.log('Computado:', window.getComputedStyle(section).speak); // "none"
```

### 3. Com Extensões
- **axe DevTools**: Verificar se não há warnings de "redundant role"
- **WAVE**: Verificar se estrutura está correta
- **Lighthouse**: Audit de acessibilidade

## 📚 Configuração Global Aplicada

Este componente agora usa a **Configuração Global de Acessibilidade**:

```typescript
// src/app/core/config/accessibility.config.ts
import { removeNativeSemantics } from '@core/config';

// Remove "grupo" programaticamente
const section = document.querySelector('.intro');
removeNativeSemantics(section); // Adiciona role="presentation" + aria-hidden
```

### CSS Global Aplicado
```scss
// src/styles/_accessibility.scss

// Remove anúncio de "grupo" automaticamente
[role="none"],
[role="presentation"] {
  speak: none;
}

// Remove semântica de section
section[role="none"],
section[aria-hidden="true"] {
  // Ignorado por leitores de tela
}
```

## ✅ Checklist de Verificação

- [x] Remover `role="presentation"` de `<section>`
- [x] Adicionar `role="none"` + `aria-hidden="true"`
- [x] Remover `tabindex="0"` de elementos não interativos
- [x] Remover `role="text"` redundante
- [x] Remover `role="heading"` redundante
- [x] Manter landmark `role="main"`
- [x] Adicionar `aria-hidden="true"` em SVG decorativo
- [x] Testar com NVDA/VoiceOver
- [x] Verificar que "grupo" não aparece mais

## 🎓 Referências

- [ARIA: none role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/none_role)
- [ARIA: presentation role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/presentation_role)
- [aria-hidden](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden)
- [WCAG 4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)

## 💡 Dica Pro

**Quando usar cada abordagem:**

| Cenário | Solução | Exemplo |
|---------|---------|---------|
| Conteúdo decorativo | `aria-hidden="true"` | Ícones, imagens de fundo |
| Container sem semântica | `role="none"` + `aria-hidden="true"` | Divs de layout |
| Elemento interativo customizado | ARIA customizado | Modal, Toggle |
| Conteúdo importante | Semântica nativa | Headings, Landmarks |

**Regra de Ouro:**
> Se não quer que seja narrado → `role="none"` + `aria-hidden="true"`  
> Se é importante → Use semântica nativa HTML5

