# Implementação de Acessibilidade no Modal Select Generic

## 📋 Como Este Componente Usa a Configuração Global

### 1. Remoção de Semântica Nativa (CSS)

O componente utiliza `role="presentation"` e `aria-hidden="true"` para remover semântica indesejada:

```html
<!-- Título puramente visual -->
<div
  class="modal-title"
  role="presentation"
  aria-hidden="true">
  <span aria-hidden="true">{{ titulo() }}</span>
</div>
```

**Resultado:** Leitor de tela **NÃO** anuncia "nível de título 2" ou "grupo"

### 2. Container de Scroll sem Semântica

```html
<div
  class="modal-scroll-container"
  aria-hidden="true"
  role="presentation">
  <!-- Conteúdo visual -->
</div>
```

**Resultado:** Container visual ignorado, apenas itens focáveis são narrados

### 3. Controle Customizado de Narração

```typescript
import { announce } from '@core/config/accessibility.config';

// Anúncio customizado ao abrir modal
private announceModalOpening(): void {
  const titulo = this.titulo();
  if (titulo) {
    announce(`${titulo}, caixa de diálogo`, 'polite', 100);
  }
}
```

**Resultado:** Narração: "Selecione o mês, caixa de diálogo" (sem "grupo" ou "nível de título")

### 4. Estilos de Foco Globais

O componente herda automaticamente os estilos de foco do CSS global:

```scss
// Aplicado automaticamente por src/styles/_accessibility.scss
*:focus-visible {
  outline: 2px solid #0046c0;
  outline-offset: 2px;
}
```

**Resultado:** Foco consistente em todos os elementos sem código adicional

### 5. IDs Únicos

```typescript
import { generateA11yId } from '@core/config/accessibility.config';

// Gerar ID único para o modal
private modalId = generateA11yId('modal');
```

**Resultado:** IDs únicos mesmo com múltiplas instâncias

### 6. Verificação de Focabilidade

```typescript
import { isNativelyFocusable } from '@core/config/accessibility.config';

private makeItemAccessible(idx: number): void {
  const itemId = this.getOptionId(this.options()[idx]?.value);
  const item = document.getElementById(`option-${itemId}`);
  
  if (item && !isNativelyFocusable(item as HTMLElement)) {
    item.setAttribute('tabindex', '-1');
  }
}
```

**Resultado:** Elementos não focáveis tornam-se focáveis automaticamente

### 7. Preferências do Usuário

```typescript
import { prefersReducedMotion } from '@core/config/accessibility.config';

private scrollToElement(element: HTMLElement): void {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  
  element.scrollIntoView({
    behavior,
    block: 'nearest'
  });
}
```

**Resultado:** Respeita preferências de acessibilidade do usuário

## 🎯 Estratégia de Acessibilidade

### Problema Original

```
Narração: "caixa de diálogo, nível de título 2, Selecione o mês, grupo, 1 de 12, não selecionado, radio button, Janeiro, botão de opção, 1 de 1, Selecione uma opção, grupo de rádio"
```

**❌ Muita informação redundante e confusa**

### Solução Implementada

```
Narração: "Selecione o mês, caixa de diálogo" (ao abrir)
Narração: "1 de 12, não selecionado Janeiro" (ao navegar)
```

**✅ Informação clara e concisa**

## 🔧 Configurações Aplicadas

### 1. Remover "grupo"

```html
<!-- ANTES (com "grupo") -->
<div role="radiogroup">
  <input type="radio">
</div>

<!-- DEPOIS (sem "grupo") -->
<div role="presentation" aria-hidden="true">
  <!-- Visual -->
</div>
<button type="button" [attr.aria-label]="customLabel">
  <!-- Acessível -->
</button>
```

### 2. Remover "nível de título 2"

```html
<!-- ANTES (com "nível de título 2") -->
<h2 id="modal-title">{{ titulo }}</h2>

<!-- DEPOIS (sem "nível de título 2") -->
<div role="presentation" aria-hidden="true">
  <span>{{ titulo }}</span>
</div>
```

### 3. Remover "botão de opção"

```html
<!-- ANTES (com "botão de opção") -->
<input type="radio" role="radio">

<!-- DEPOIS (sem "botão de opção") -->
<button type="button" role="none" [attr.aria-label]="customLabel">
  <!-- Narração customizada -->
</button>
```

## 📊 Benefícios da Configuração Global

### 1. Consistência

✅ Todos os componentes herdam mesmos estilos de foco  
✅ Mesma estratégia de remoção de semântica  
✅ Mesmos padrões de anúncio  

### 2. Manutenibilidade

✅ Configuração centralizada em um lugar  
✅ Fácil de atualizar para todos os componentes  
✅ Reduz duplicação de código  

### 3. Performance

✅ CSS global carregado uma vez  
✅ Funções utilitárias reutilizadas  
✅ Sem overhead de configuração por componente  

### 4. Testabilidade

✅ Modo debug global para todos os componentes  
✅ Logs centralizados  
✅ Fácil de validar compliance WCAG  

## 🧪 Testando

### Habilitar Debug Mode

```typescript
// No console do navegador
import { enableDebugMode } from '@core/config/accessibility.config';
enableDebugMode();
```

### Verificar Narração

1. Ativar leitor de tela (NVDA, VoiceOver, etc)
2. Navegar pelo modal com Tab
3. Verificar anúncios customizados

### Verificar Foco

1. Habilitar debug mode
2. Navegar com Tab
3. Verificar outlines coloridos

## 📚 Referências

- [Configuração Global](../../../core/config/ACCESSIBILITY-GUIDE.md)
- [CSS Global](../../../../styles/_accessibility.scss)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

