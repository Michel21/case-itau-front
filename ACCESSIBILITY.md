# Acessibilidade do Projeto

## 🎯 Visão Geral

Este projeto implementa configurações globais de acessibilidade que permitem **controlar completamente a semântica nativa HTML**, removendo anúncios indesejados e fornecendo narração customizada via ARIA.

## 📁 Estrutura

```
src/
├── styles/
│   └── _accessibility.scss          # CSS global de acessibilidade
├── app/
│   ├── core/
│   │   └── config/
│   │       ├── accessibility.config.ts      # Config TypeScript
│   │       ├── ACCESSIBILITY-GUIDE.md       # Guia completo
│   │       └── index.ts                     # Barrel export
│   └── shared/
│       ├── directives/
│       │   ├── tab-navigation.directive.ts  # Navegação por Tab
│       │   ├── scroll-into-view.directive.ts
│       │   └── focus-trap.directive.ts
│       └── components/
│           └── modal-periodo/
│               └── ACCESSIBILITY-IMPLEMENTATION.md  # Exemplo de uso
└── tsconfig.json                    # Path aliases configurados
```

## 🚀 Quick Start

### 1. Importar Configuração

```typescript
import {
  announce,
  removeNativeSemantics,
  generateA11yId,
  isNativelyFocusable,
  enableDebugMode,
  NAVIGATION_KEYS,
  ARIA_ROLES
} from '@core/config';
```

### 2. Remover Semântica Nativa (HTML)

```html
<!-- Remover "grupo" -->
<div role="presentation" aria-hidden="true">
  Conteúdo visual
</div>

<!-- Remover "nível de título 2" -->
<h2 role="presentation" aria-hidden="true">
  Título visual
</h2>

<!-- Remover "botão" -->
<button role="none" [attr.aria-label]="customLabel">
  Controle customizado
</button>
```

### 3. Remover Semântica Nativa (TypeScript)

```typescript
import { removeNativeSemantics } from '@core/config';

const element = document.getElementById('my-element');
if (element) {
  removeNativeSemantics(element);
  // Adiciona role="presentation" e aria-hidden="true"
}
```

### 4. Anúncios Customizados

```typescript
import { announce } from '@core/config';

// Anúncio ao abrir modal
announce('Selecione o mês, caixa de diálogo');

// Anúncio de erro (urgente)
announce('Erro ao salvar!', 'assertive');

// Com delay
announce('Processando...', 'polite', 500);
```

## 🎨 CSS Global

### Classes Utilitárias

```html
<!-- Screen reader only -->
<span class="sr-only">Texto apenas para leitores de tela</span>

<!-- Visual only -->
<span class="visual-only" aria-hidden="true">Ícone decorativo</span>
```

### Estilos de Foco Automáticos

Todos os elementos focáveis recebem automaticamente:

```scss
*:focus-visible {
  outline: 2px solid #0046c0;
  outline-offset: 2px;
}
```

### Controle de Semântica

```scss
// Remove anúncio de "botão"
[role="none"],
[role="presentation"] {
  speak: none;
}

// Remove anúncio de "grupo"
div[role="radiogroup"][aria-hidden="true"] {
  speak: none;
}

// Remove "nível de título"
h1[role="presentation"],
h2[role="presentation"] {
  // Sem semântica de heading
}
```

## 🔧 Configurações

### Path Aliases (tsconfig.json)

```json
{
  "paths": {
    "@core/*": ["src/app/core/*"],
    "@shared/*": ["src/app/shared/*"],
    "@features/*": ["src/app/features/*"]
  }
}
```

### Importação Simplificada

```typescript
// ANTES
import { announce } from '../../../core/config/accessibility.config';

// DEPOIS
import { announce } from '@core/config';
```

## 🧪 Debug Mode

### Habilitar no Console

```javascript
// Abrir console do navegador
import('@core/config').then(({ enableDebugMode }) => {
  enableDebugMode();
});
```

### Habilitar no HTML

```html
<body class="debug-a11y">
  <!-- Mostra outlines coloridos:
       🟧 Laranja: elementos com tabindex
       🟩 Verde: botões, links, inputs
       🟥 Vermelho: elementos aria-hidden
  -->
</body>
```

## 📊 Estratégia

### Problema Comum

```
❌ Narração: "caixa de diálogo, nível de título 2, Selecione o mês, grupo, 1 de 12, não selecionado, radio button, Janeiro, botão de opção"
```

**Muita informação redundante**

### Solução Implementada

```
✅ Narração: "Selecione o mês, caixa de diálogo"
✅ Narração: "1 de 12, não selecionado Janeiro"
```

**Informação clara e concisa**

### Como Funciona

1. **Elementos visuais**: `role="presentation"` + `aria-hidden="true"`
2. **Elementos acessíveis**: `aria-label` customizado
3. **Separação total**: Visual ≠ Acessível

## ✅ WCAG Compliance

### Level A ✅
- 1.1.1 Non-text Content
- 2.1.1 Keyboard
- 4.1.2 Name, Role, Value

### Level AA ✅
- 1.4.3 Contrast (Minimum)
- 2.4.7 Focus Visible
- 4.1.3 Status Messages

### Level AAA ⚠️
- 1.4.6 Contrast (Enhanced) - Parcial
- 2.4.8 Location

## 🧰 Ferramentas

### Leitores de Tela

- **NVDA** (Windows - Gratuito)
- **JAWS** (Windows - Pago)
- **VoiceOver** (macOS/iOS - Nativo)
- **TalkBack** (Android - Nativo)

### Extensões Chrome

- **Lighthouse** (Audit de acessibilidade)
- **axe DevTools** (Testes automatizados)
- **WAVE** (Análise visual)

## 📚 Documentação

### Guias Completos

- [📖 Guia de Acessibilidade](src/app/core/config/ACCESSIBILITY-GUIDE.md)
- [🎨 CSS Global](src/styles/_accessibility.scss)
- [💻 Config TypeScript](src/app/core/config/accessibility.config.ts)
- [📝 Exemplo de Implementação](src/app/shared/components/modal-periodo/ACCESSIBILITY-IMPLEMENTATION.md)

### Diretivas

- [TabNavigationDirective](src/app/shared/directives/TAB-NAVIGATION.md) - Navegação por Tab
- [ScrollIntoViewDirective](src/app/shared/directives/SCROLL-INTO-VIEW.md) - Scroll automático
- [FocusTrapDirective](src/app/shared/directives/) - Trap de foco em modais

## 🤝 Contribuindo

### Adicionar Nova Configuração

1. Adicionar CSS em `src/styles/_accessibility.scss`
2. Adicionar TypeScript em `src/app/core/config/accessibility.config.ts`
3. Documentar em `ACCESSIBILITY-GUIDE.md`
4. Criar testes unitários

### Padrões de Código

```typescript
// ✅ BOM: Usar configuração global
import { announce } from '@core/config';
announce('Mensagem');

// ❌ RUIM: Criar função local
function myAnnounce(msg: string) {
  const div = document.createElement('div');
  div.setAttribute('aria-live', 'polite');
  // ...
}
```

## 🎓 Recursos

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)

## 📧 Suporte

Para questões de acessibilidade:

1. Consultar [ACCESSIBILITY-GUIDE.md](src/app/core/config/ACCESSIBILITY-GUIDE.md)
2. Testar com leitores de tela
3. Usar modo debug
4. Abrir issue no repositório

---

**Mantido por:** Equipe de Desenvolvimento  
**Última atualização:** Novembro 2025  
**Versão:** 1.0.0

