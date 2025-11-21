# TabNavigationDirective

Diretiva especializada para navegação acessível via Tab. Garante que elementos focados via teclado permaneçam sempre visíveis na tela.

## 🎯 Objetivo

Melhorar a experiência de navegação por teclado garantindo que:
- Elementos focados via Tab/Shift+Tab fiquem sempre visíveis
- Scroll seja suave e natural
- Acessibilidade seja mantida (WCAG 2.1 AA)
- Leitores de tela recebam feedback adequado

## 📦 Instalação

```typescript
import { TabNavigationDirective } from '@shared/directives';

@Component({
  imports: [TabNavigationDirective]
})
```

## 🚀 Uso Básico

```html
<!-- Uso simples - scroll suave ao receber foco via Tab -->
<button appTabNavigation>
  Botão
</button>

<!-- Em formulário -->
<form>
  <input appTabNavigation placeholder="Nome">
  <input appTabNavigation placeholder="Email">
  <button appTabNavigation type="submit">Enviar</button>
</form>
```

## ⚙️ Configuração

### enableTabScroll
Habilita/desabilita scroll automático.

```html
<!-- Habilitado (padrão) -->
<button appTabNavigation>Scroll ativo</button>

<!-- Desabilitado -->
<button appTabNavigation [enableTabScroll]="false">Sem scroll</button>
```

**Padrão:** `true`

### tabScrollBehavior
Comportamento do scroll.

```html
<!-- Scroll suave (padrão) -->
<button appTabNavigation [tabScrollBehavior]="'smooth'">Suave</button>

<!-- Scroll instantâneo -->
<button appTabNavigation [tabScrollBehavior]="'auto'">Instantâneo</button>
```

**Opções:** `'smooth'` | `'auto'`  
**Padrão:** `'smooth'`

### tabScrollPosition
Posição do elemento no viewport após scroll.

```html
<!-- Posição mais próxima (padrão) -->
<button appTabNavigation [tabScrollPosition]="'nearest'">Nearest</button>

<!-- Topo do viewport -->
<button appTabNavigation [tabScrollPosition]="'start'">Topo</button>

<!-- Centro do viewport -->
<button appTabNavigation [tabScrollPosition]="'center'">Centro</button>

<!-- Final do viewport -->
<button appTabNavigation [tabScrollPosition]="'end'">Final</button>
```

**Opções:** `'nearest'` | `'start'` | `'center'` | `'end'`  
**Padrão:** `'nearest'`

### tabScrollOffset
Offset em pixels para compensar headers/toolbars fixos.

```html
<!-- Sem offset (padrão) -->
<button appTabNavigation>Sem offset</button>

<!-- Com offset de 80px -->
<button appTabNavigation [tabScrollOffset]="80">Com offset</button>

<!-- Com offset dinâmico -->
<button appTabNavigation [tabScrollOffset]="headerHeight">Dinâmico</button>
```

**Padrão:** `0`

### tabScrollDelay
Delay em ms antes de fazer scroll (útil para animações).

```html
<!-- Sem delay (padrão) -->
<button appTabNavigation>Sem delay</button>

<!-- Com delay de 300ms -->
<button appTabNavigation [tabScrollDelay]="300">Com delay</button>
```

**Padrão:** `0`

### tabScrollIfNeeded
Scroll apenas se elemento não estiver visível.

```html
<!-- Scroll inteligente (padrão) -->
<button appTabNavigation [tabScrollIfNeeded]="true">Inteligente</button>

<!-- Scroll sempre -->
<button appTabNavigation [tabScrollIfNeeded]="false">Sempre</button>
```

**Padrão:** `true`

### announceOnFocus
Anuncia foco para leitores de tela.

```html
<!-- Sem anúncio (padrão) -->
<button appTabNavigation>Sem anúncio</button>

<!-- Com anúncio -->
<button 
  appTabNavigation 
  [announceOnFocus]="true"
  aria-label="Botão de enviar">
  Enviar
</button>
```

**Padrão:** `false`

### focusAnnouncement
Mensagem personalizada para leitores de tela.

```html
<button 
  appTabNavigation 
  [announceOnFocus]="true"
  [focusAnnouncement]="'Botão de enviar formulário'"
>
  Enviar
</button>
```

## 📱 Exemplos Práticos

### Formulário Completo

```html
<form appTabNavigation [tabScrollPosition]="'start'">
  <h2>Cadastro</h2>
  
  <input 
    type="text" 
    placeholder="Nome"
    appTabNavigation
    [tabScrollOffset]="60">
  
  <input 
    type="email" 
    placeholder="Email"
    appTabNavigation
    [tabScrollOffset]="60">
  
  <input 
    type="password" 
    placeholder="Senha"
    appTabNavigation
    [tabScrollOffset]="60">
  
  <button 
    type="submit"
    appTabNavigation
    [announceOnFocus]="true"
    [focusAnnouncement]="'Enviar formulário de cadastro'">
    Cadastrar
  </button>
</form>
```

### Navegação em Lista

```html
<ul class="menu">
  @for (item of menuItems; track item.id) {
    <li>
      <a 
        [href]="item.url"
        appTabNavigation
        [tabScrollBehavior]="'smooth'"
        [tabScrollPosition]="'nearest'">
        {{ item.label }}
      </a>
    </li>
  }
</ul>
```

### Modal com Header Fixo

```html
<div class="modal">
  <header class="modal-header" style="position: sticky; height: 60px;">
    <h2>Título</h2>
  </header>
  
  <div class="modal-body">
    <button 
      appTabNavigation
      [tabScrollOffset]="60"
      [tabScrollPosition]="'start'">
      Opção 1
    </button>
    
    <button 
      appTabNavigation
      [tabScrollOffset]="60"
      [tabScrollPosition]="'start'">
      Opção 2
    </button>
  </div>
</div>
```

### Toggle/Select com Anúncio

```html
<app-toggle-segmented
  [options]="options"
  formControlName="tipo"
  appTabNavigation
  [announceOnFocus]="true"
  [focusAnnouncement]="'Tipo de período'"
/>
```

## ♿ Acessibilidade

### WCAG 2.1 Level AA

✅ **2.4.3 Focus Order**: Elementos em ordem lógica  
✅ **2.4.7 Focus Visible**: Foco sempre visível  
✅ **4.1.3 Status Messages**: Anúncios via aria-live

### Recursos de Acessibilidade

1. **Detecção de navegação por Tab**
   - Distingue entre foco via Tab e foco via mouse/touch
   - Scroll apenas para navegação por teclado

2. **Anúncios para leitores de tela**
   - Região `aria-live` temporária
   - Anúncios personalizáveis
   - Cleanup automático

3. **Elementos focáveis**
   - Adiciona `tabindex="0"` automaticamente em elementos não focáveis
   - Não interfere em elementos naturalmente focáveis

## 🔧 Como Funciona

### Fluxo de Navegação

1. **Usuário pressiona Tab**
   ```
   document:keydown.tab → isTabNavigation = true
   ```

2. **Elemento recebe foco**
   ```
   element:focus → Verificar se foi Tab navigation
   ```

3. **Verificar visibilidade** (se `tabScrollIfNeeded = true`)
   ```
   isElementVisible() → true: skip | false: scroll
   ```

4. **Fazer scroll**
   ```
   requestAnimationFrame(() => scrollToElement())
   ```

5. **Anunciar** (se `announceOnFocus = true`)
   ```
   Criar aria-live region → Anunciar → Remover
   ```

### Detecção de Tab

A diretiva detecta navegação por Tab usando `@HostListener`:

```typescript
@HostListener('document:keydown.tab')
@HostListener('document:keydown.shift.tab')
onTabKeyDown(): void {
  this.isTabNavigation = true;
}
```

Isso garante que scroll aconteça **apenas** para navegação por teclado, não para cliques.

## 🎨 Estilização

A diretiva não adiciona estilos CSS. Para feedback visual de foco:

```scss
*:focus-visible {
  outline: 2px solid #0046c0;
  outline-offset: 2px;
}
```

## ⚡ Performance

- ✅ Usa `requestAnimationFrame` para scroll suave
- ✅ Verifica visibilidade antes de scrollar
- ✅ Cleanup automático de event listeners
- ✅ Debounce interno para evitar scroll excessivo

## 🧪 Testes

```bash
# Rodar testes da diretiva
npm test -- tab-navigation.directive.spec
```

### Cobertura

✅ **> 90%** de cobertura de código  
✅ **Testes de navegação** por Tab/Shift+Tab  
✅ **Testes de visibilidade**  
✅ **Testes de acessibilidade**  
✅ **Testes de scroll com offset**

## 🆚 Comparação com ScrollIntoViewDirective

| Feature | TabNavigation | ScrollIntoView |
|---------|--------------|----------------|
| **Foco** | Navegação por Tab | Qualquer foco |
| **Detecção** | Específica para Tab | Genérica |
| **Uso** | Formulários, listas | Geral |
| **Anúncios** | Integrado | Não |
| **Complexidade** | Baixa | Média |

**Recomendação:** Use `TabNavigationDirective` para navegação por Tab e `ScrollIntoViewDirective` para casos mais genéricos.

## 📚 Referências

- [WCAG 2.1 - Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [MDN - scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)
- [WAI-ARIA - Live Regions](https://www.w3.org/TR/wai-aria-1.2/#live_region_roles)

