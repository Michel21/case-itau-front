# Guia de Configuração Global de Acessibilidade

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração CSS Global](#configuração-css-global)
3. [Configuração TypeScript](#configuração-typescript)
4. [Como Usar](#como-usar)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Debug e Testes](#debug-e-testes)
7. [WCAG Compliance](#wcag-compliance)

## 🎯 Visão Geral

Este projeto possui configurações globais de acessibilidade que permitem:

- ✅ **Remover semântica nativa** de elementos HTML
- ✅ **Controlar narração** via ARIA customizada
- ✅ **Estilos de foco** consistentes (WCAG 2.1 AA)
- ✅ **Live regions** para anúncios dinâmicos
- ✅ **Navegação por teclado** otimizada
- ✅ **Debug mode** para testes

## 🎨 Configuração CSS Global

### Localização
```
src/styles/_accessibility.scss
```

### Importação
Já está importado globalmente em `src/styles.scss`:

```scss
@use "styles/accessibility" as *;
```

### Classes Utilitárias

#### 1. Screen Reader Only (sr-only)
Oculta visualmente mas mantém acessível:

```html
<span class="sr-only">Texto apenas para leitores de tela</span>
```

#### 2. Visual Only
Oculta de leitores de tela mas mantém visível:

```html
<span class="visual-only" aria-hidden="true">Ícone decorativo</span>
```

### Controle de Semântica Nativa

#### Remover "grupo" e outros anúncios indesejados:

```html
<!-- Remove anúncio de "botão" -->
<div role="none">
  Conteúdo puramente visual
</div>

<!-- Remove anúncio de "heading nível 2" -->
<h2 role="presentation">
  Título visual sem semântica
</h2>

<!-- Remove anúncio de "lista" -->
<ul role="none">
  <li role="none">Item sem semântica</li>
</ul>
```

### Estilos de Foco Automáticos

Todos os elementos focáveis têm outline consistente:

```scss
// Automático via CSS global
*:focus-visible {
  outline: 2px solid #0046c0;
  outline-offset: 2px;
}
```

Para customizar:

```scss
.meu-componente:focus-visible {
  outline-color: #ff0000; // Vermelho
  outline-width: 3px;
}
```

## 💻 Configuração TypeScript

### Localização
```
src/app/core/config/accessibility.config.ts
```

### Importação

```typescript
import {
  DEFAULT_ACCESSIBILITY_CONFIG,
  announce,
  generateA11yId,
  isNativelyFocusable,
  removeNativeSemantics,
  enableDebugMode,
  NAVIGATION_KEYS,
  ARIA_ROLES
} from '@core/config/accessibility.config';
```

## 🚀 Como Usar

### 1. Remover Semântica Nativa (HTML)

```html
<!-- Método 1: Via role="none" ou "presentation" -->
<div role="presentation" aria-hidden="true">
  Conteúdo puramente visual
</div>

<!-- Método 2: Via classes CSS -->
<div class="visual-only" aria-hidden="true">
  Decoração visual
</div>
```

### 2. Remover Semântica Nativa (TypeScript)

```typescript
import { removeNativeSemantics } from '@core/config/accessibility.config';

const element = document.getElementById('meu-elemento');
if (element) {
  removeNativeSemantics(element);
  // Adiciona role="presentation" e aria-hidden="true"
}
```

### 3. Anúncios para Leitores de Tela

```typescript
import { announce } from '@core/config/accessibility.config';

// Anúncio padrão (polite)
announce('Filtro aplicado com sucesso');

// Anúncio urgente (assertive)
announce('Erro ao salvar!', 'assertive');

// Com delay customizado
announce('Processando...', 'polite', 500);
```

### 4. Gerar IDs Únicos

```typescript
import { generateA11yId } from '@core/config/accessibility.config';

const modalId = generateA11yId('modal'); // 'modal-1-1732198765432'
const inputId = generateA11yId('input'); // 'input-2-1732198765433'
```

### 5. Verificar Focabilidade

```typescript
import { isNativelyFocusable } from '@core/config/accessibility.config';

const button = document.querySelector('button');
if (button && !isNativelyFocusable(button)) {
  button.setAttribute('tabindex', '0');
}
```

### 6. Preferências do Usuário

```typescript
import {
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode
} from '@core/config/accessibility.config';

if (prefersReducedMotion()) {
  // Desabilitar animações
  element.style.transition = 'none';
}

if (prefersHighContrast()) {
  // Aumentar contraste
  element.style.outlineWidth = '3px';
}

if (prefersDarkMode()) {
  // Aplicar tema escuro
  document.body.classList.add('dark-theme');
}
```

## 📝 Exemplos Práticos

### Exemplo 1: Modal com Semântica Customizada

```html
<!-- HTML -->
<div
  role="dialog"
  [attr.aria-label]="titulo"
  [attr.aria-modal]="true">
  
  <!-- Título puramente visual (não narrado) -->
  <div role="presentation" aria-hidden="true" class="modal-title">
    {{ titulo }}
  </div>
  
  <!-- Conteúdo focável -->
  <div class="modal-body">
    <button>Opção 1</button>
    <button>Opção 2</button>
  </div>
</div>
```

```typescript
// TypeScript
import { announce } from '@core/config/accessibility.config';

openModal(): void {
  this.isOpen.set(true);
  announce(`${this.titulo}, caixa de diálogo`, 'polite', 100);
}
```

### Exemplo 2: Toggle Segmented com Semântica Customizada

```html
<!-- Elementos visuais -->
<div class="toggle-visual" role="none" aria-hidden="true">
  <div class="option">Opção 1</div>
  <div class="option">Opção 2</div>
</div>

<!-- Elementos acessíveis (overlay invisível) -->
@for (option of options; track option.value; let i = $index) {
  <button
    type="button"
    class="sr-only-option"
    [attr.aria-label]="getCustomAnnouncement(option, i)"
    [tabindex]="getTabIndex(option)"
    (click)="selectOption(option)">
    <!-- Botão visualmente oculto mas acessível -->
  </button>
}
```

### Exemplo 3: Lista Customizada sem "grupo"

```html
<div
  role="none"
  aria-hidden="true"
  class="visual-container">
  
  <!-- Lista visual -->
  @for (item of items; track item.id) {
    <div class="item">{{ item.label }}</div>
  }
</div>

<!-- Controles acessíveis separados -->
@for (item of items; track item.id; let i = $index) {
  <button
    type="button"
    [attr.aria-label]="getItemAnnouncement(item, i)"
    [tabindex]="getTabIndex(i)"
    (click)="selectItem(item)">
    <!-- Controle invisível -->
  </button>
}
```

## 🐛 Debug e Testes

### Habilitar Debug Mode

```typescript
import { enableDebugMode, disableDebugMode } from '@core/config/accessibility.config';

// No console do navegador ou no código
enableDebugMode();

// Adiciona classe 'debug-a11y' no body
// Mostra outlines em todos os elementos focáveis
// Loga anúncios e navegação no console
```

### Modo Debug no HTML

```html
<!-- Adicionar classe manualmente -->
<body class="debug-a11y">
  <!-- Mostra outlines coloridos:
       - Laranja: elementos com tabindex
       - Verde: botões, links, inputs
       - Vermelho: elementos aria-hidden
  -->
</body>
```

### Testar com Leitores de Tela

1. **NVDA (Windows - Gratuito)**
   - Download: https://www.nvaccess.org/
   - Atalho: `NVDA + N` para menu

2. **JAWS (Windows - Pago)**
   - Download: https://www.freedomscientific.com/
   - Atalho: `Insert + F1` para ajuda

3. **VoiceOver (macOS - Nativo)**
   - Atalho: `Cmd + F5` para ativar
   - Navegação: `Ctrl + Option + Setas`

4. **TalkBack (Android - Nativo)**
   - Configurações > Acessibilidade > TalkBack

5. **VoiceOver (iOS - Nativo)**
   - Ajustes > Acessibilidade > VoiceOver

### Ferramentas de Teste

```bash
# Lighthouse (Chrome DevTools)
# Accessibility > Run audit

# axe DevTools (Extensão Chrome)
# https://www.deque.com/axe/devtools/

# WAVE (Extensão Chrome/Firefox)
# https://wave.webaim.org/extension/
```

## ✅ WCAG Compliance

### Level A (Mínimo)

✅ **1.1.1 Non-text Content**: Alternativas textuais via `aria-label`  
✅ **2.1.1 Keyboard**: Navegação completa por teclado  
✅ **2.4.1 Bypass Blocks**: Skip links e landmarks  
✅ **4.1.2 Name, Role, Value**: ARIA completo  

### Level AA (Recomendado)

✅ **1.4.3 Contrast**: Contraste mínimo 4.5:1  
✅ **2.4.7 Focus Visible**: Foco sempre visível  
✅ **3.2.4 Consistent Identification**: Componentes consistentes  
✅ **4.1.3 Status Messages**: Live regions para anúncios  

### Level AAA (Avançado)

⚠️ **1.4.6 Contrast Enhanced**: Contraste 7:1 (parcial)  
✅ **2.4.8 Location**: Breadcrumbs e indicadores  
✅ **3.2.5 Change on Request**: Sem mudanças automáticas  

## 📚 Referências

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## 🤝 Contribuindo

Para adicionar novas configurações:

1. Adicionar CSS em `src/styles/_accessibility.scss`
2. Adicionar TypeScript em `src/app/core/config/accessibility.config.ts`
3. Documentar neste arquivo
4. Adicionar testes em `*.spec.ts`

## 📧 Suporte

Para dúvidas ou problemas com acessibilidade:

- Abrir issue no repositório
- Consultar a documentação dos componentes
- Testar com leitores de tela

