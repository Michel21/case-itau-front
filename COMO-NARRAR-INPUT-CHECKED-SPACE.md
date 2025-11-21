# 🎤 Como Narrar Input Checked ao Pressionar Space

## 📋 Resumo Executivo

Para narrar corretamente quando um input (radio/checkbox) é selecionado ao pressionar **Space**, você precisa:

1. ✅ Usar `role="radio"` ou `role="checkbox"` em buttons
2. ✅ Atualizar `aria-checked` dinamicamente
3. ✅ Adicionar texto de estado no `aria-label`
4. ✅ Usar `LiveAnnouncer` do Angular CDK para anúncios robustos
5. ✅ Prevenir comportamento padrão com `$event.preventDefault()`

---

## 🎯 Solução Completa (Angular 19)

### 1️⃣ Template (HTML)

```html
<!-- Live Region para Anúncios -->
<div 
  id="status-message" 
  class="visually-hidden" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true">
</div>

<!-- Radio Group -->
<div role="radiogroup" aria-labelledby="tipo-periodo-label">
  <span id="tipo-periodo-label" class="visually-hidden">Tipo de período</span>

  <!-- Opção 1: Intervalo -->
  <button
    type="button"
    role="radio"
    id="tipo-intervalo"
    class="segment-control__option"
    [class.segment-control__option--active]="tipoPeriodo() === 'intervalo'"
    [attr.aria-checked]="tipoPeriodo() === 'intervalo' ? 'true' : 'false'"
    [attr.aria-label]="'Intervalo, ' + (tipoPeriodo() === 'intervalo' ? 'selecionado' : 'não selecionado') + ', 1 de 2'"
    aria-posinset="1"
    aria-setsize="2"
    tabindex="0"
    (click)="selecionarPeriodo('intervalo')"
    (keydown.space)="selecionarPeriodo('intervalo'); $event.preventDefault()"
    (keydown.enter)="selecionarPeriodo('intervalo'); $event.preventDefault()">
    Intervalo
  </button>

  <!-- Opção 2: Mês -->
  <button
    type="button"
    role="radio"
    id="tipo-mes"
    class="segment-control__option"
    [class.segment-control__option--active]="tipoPeriodo() === 'mes'"
    [attr.aria-checked]="tipoPeriodo() === 'mes' ? 'true' : 'false'"
    [attr.aria-label]="'Mês, ' + (tipoPeriodo() === 'mes' ? 'selecionado' : 'não selecionado') + ', 2 de 2'"
    aria-posinset="2"
    aria-setsize="2"
    tabindex="0"
    (click)="selecionarPeriodo('mes')"
    (keydown.space)="selecionarPeriodo('mes'); $event.preventDefault()"
    (keydown.enter)="selecionarPeriodo('mes'); $event.preventDefault()">
    Mês
  </button>
</div>
```

---

### 2️⃣ Component TypeScript

```typescript
import { Component, signal, effect, inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-filtro',
  standalone: true,
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss']
})
export class FiltroComponent {
  // ============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // ============================================================================
  
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  // ============================================================================
  // SIGNALS
  // ============================================================================
  
  readonly tipoPeriodo = signal<'intervalo' | 'mes'>('mes');

  // ============================================================================
  // CONSTRUCTOR - EFFECTS
  // ============================================================================
  
  constructor() {
    // Effect: Anunciar mudanças de seleção
    effect(() => {
      const tipo = this.tipoPeriodo();
      const mensagem = tipo === 'intervalo' 
        ? 'Intervalo selecionado, 1 de 2'
        : 'Mês selecionado, 2 de 2';
      
      // Usar LiveAnnouncer do Angular CDK (mais confiável)
      queueMicrotask(() => {
        this.liveAnnouncer.announce(mensagem, 'polite');
      });
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Seleciona o tipo de período
   * Chamado por click, Space e Enter
   */
  selecionarPeriodo(tipo: 'intervalo' | 'mes'): void {
    this.tipoPeriodo.set(tipo);
    
    // Effect já vai anunciar automaticamente via LiveAnnouncer
    // Mas você pode adicionar anúncio manual também:
    const mensagem = tipo === 'intervalo'
      ? 'Intervalo selecionado'
      : 'Mês selecionado';
    
    console.log(`🎤 ${mensagem}`);
  }

  // ============================================================================
  // MÉTODOS ALTERNATIVOS DE ANÚNCIO
  // ============================================================================

  /**
   * Método alternativo: Usar aria-live region manual
   */
  private anunciarViaAriaLive(mensagem: string): void {
    const liveRegion = document.getElementById('status-message');
    if (liveRegion) {
      // Limpar primeiro
      liveRegion.textContent = '';
      
      // Anunciar após um tick
      setTimeout(() => {
        liveRegion.textContent = mensagem;
      }, 100);
    }
  }

  /**
   * Método recomendado: Usar LiveAnnouncer do Angular CDK
   * Mais robusto e testado
   */
  private anunciarComLiveAnnouncer(
    mensagem: string, 
    politeness: 'polite' | 'assertive' = 'polite'
  ): void {
    this.liveAnnouncer.announce(mensagem, politeness);
  }
}
```

---

### 3️⃣ SCSS para Visually Hidden

```scss
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.segment-control {
  display: flex;
  gap: 0.5rem;
  
  &__option {
    padding: 0.75rem 1.5rem;
    border: 2px solid #ddd;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:focus {
      outline: 3px solid #005EA2;
      outline-offset: 2px;
    }
    
    &--active {
      background: #005EA2;
      color: white;
      border-color: #005EA2;
    }
  }
}
```

---

## 🔑 Pontos-Chave para Narração Funcionar

### ✅ 1. Use `role="radio"` ou `role="checkbox"`

```html
<button type="button" role="radio">
  <!-- Transforma button em radio para leitores de tela -->
</button>
```

### ✅ 2. Atualize `aria-checked` Dinamicamente

```html
[attr.aria-checked]="tipoPeriodo() === 'intervalo' ? 'true' : 'false'"
```

**O que o leitor de tela narra:**
- ✅ Quando `aria-checked="true"`: "**Intervalo, selecionado**, botão de opção, 1 de 2"
- ✅ Quando `aria-checked="false"`: "**Intervalo, não selecionado**, botão de opção, 1 de 2"

### ✅ 3. Adicione Estado no `aria-label`

```html
[attr.aria-label]="'Intervalo, ' + (tipoPeriodo() === 'intervalo' ? 'selecionado' : 'não selecionado') + ', 1 de 2'"
```

**Por que isso funciona:**
- Combina o nome + estado + posição
- Leitor de tela lê tudo junto ao focar

### ✅ 4. Use `aria-posinset` e `aria-setsize`

```html
aria-posinset="1"   <!-- Posição no conjunto -->
aria-setsize="2"    <!-- Total de itens -->
```

**O que narra:**
- "1 de 2" ou "2 de 2"

### ✅ 5. Previna Comportamento Padrão da Tecla Space

```html
(keydown.space)="selecionarPeriodo('intervalo'); $event.preventDefault()"
```

**Por que `$event.preventDefault()`?**
- Sem isso, a tecla Space pode rolar a página
- Com isso, garante que apenas a seleção acontece

### ✅ 6. Use LiveAnnouncer do Angular CDK

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

private readonly liveAnnouncer = inject(LiveAnnouncer);

this.liveAnnouncer.announce('Mês selecionado', 'polite');
```

**Vantagens sobre aria-live manual:**
- ✅ Gerencia timing automaticamente
- ✅ Funciona em todos os navegadores
- ✅ Cleanup automático
- ✅ Suporta múltiplas mensagens em fila

---

## 🎯 Exemplo Completo de Checkbox

```html
<div role="group" aria-labelledby="opcoes-label">
  <span id="opcoes-label" class="visually-hidden">Opções disponíveis</span>

  <button
    type="button"
    role="checkbox"
    [attr.aria-checked]="opcao1Selecionada() ? 'true' : 'false'"
    [attr.aria-label]="'Opção 1, ' + (opcao1Selecionada() ? 'marcada' : 'desmarcada')"
    (click)="toggleOpcao1()"
    (keydown.space)="toggleOpcao1(); $event.preventDefault()">
    Opção 1
  </button>
</div>
```

```typescript
readonly opcao1Selecionada = signal(false);

toggleOpcao1(): void {
  this.opcao1Selecionada.update(v => !v);
  
  const mensagem = this.opcao1Selecionada()
    ? 'Opção 1 marcada'
    : 'Opção 1 desmarcada';
  
  this.liveAnnouncer.announce(mensagem, 'polite');
}
```

---

## 🧪 Como Testar

### 1. **VoiceOver (macOS)**

```bash
# Ativar VoiceOver
Cmd + F5

# Navegar
Tab / Shift+Tab

# Ler item atual
Control + Option + Space

# Interagir
Space (para selecionar)
```

**O que você deve ouvir ao pressionar Space:**
1. Som de clique
2. "Mês, selecionado, 2 de 2, botão de opção"
3. (Se tiver LiveAnnouncer) "Mês selecionado"

### 2. **NVDA (Windows)**

```bash
# Ativar NVDA
Ctrl + Alt + N

# Navegar
Tab

# Interagir
Space (para selecionar)
```

### 3. **ChromeVox (Chrome)**

```bash
# Ativar ChromeVox
Ctrl + Alt + Z (Linux/Chrome OS)

# Navegar e interagir
Tab + Space
```

---

## 📊 Comparação de Abordagens

| Método | Confiabilidade | Facilidade | Recomendado |
|--------|----------------|------------|-------------|
| `aria-live` manual | ⚠️ Médio | 🟡 Médio | ❌ Não |
| `LiveAnnouncer` (Angular CDK) | ✅ Alto | ✅ Fácil | ✅ **SIM** |
| `aria-label` dinâmico | ✅ Alto | ✅ Fácil | ✅ SIM |
| `aria-checked` | ✅ Alto | ✅ Fácil | ✅ **SIM** |

---

## 🚀 Checklist de Implementação

- [ ] Instalar Angular CDK (`npm install @angular/cdk`)
- [ ] Importar `LiveAnnouncer` no component
- [ ] Usar `role="radio"` ou `role="checkbox"` em buttons
- [ ] Adicionar `aria-checked` dinâmico
- [ ] Incluir estado no `aria-label`
- [ ] Adicionar `aria-posinset` e `aria-setsize`
- [ ] Implementar `(keydown.space)` com `preventDefault()`
- [ ] Criar `effect()` para anunciar mudanças
- [ ] Usar `queueMicrotask()` para timing correto
- [ ] Testar com VoiceOver/NVDA

---

## 🎓 Exemplo do Seu Código (case-itau-front)

### HTML (linhas 48-84)

```html
<div role="radiogroup" aria-labelledby="tipo-periodo-label" class="segment-control">
  <span id="tipo-periodo-label" class="visually-hidden">Tipo de período</span>

  <!-- INTERVALO -->
  <button
    type="button"
    role="radio"
    [attr.aria-checked]="tipoPeriodo() === 'intervalo' ? 'true' : 'false'"
    [attr.aria-label]="'Intervalo, ' + (tipoPeriodo() === 'intervalo' ? 'selecionado' : 'não selecionado') + ', 1 de 2'"
    tabindex="0"
    (keydown.space)="selecionarPeriodo('intervalo'); $event.preventDefault()">
    Intervalo
  </button>

  <!-- MÊS -->
  <button
    type="button"
    role="radio"
    [attr.aria-checked]="tipoPeriodo() === 'mes' ? 'true' : 'false'"
    [attr.aria-label]="'Mês, ' + (tipoPeriodo() === 'mes' ? 'selecionado' : 'não selecionado') + ', 2 de 2'"
    tabindex="0"
    (keydown.space)="selecionarPeriodo('mes'); $event.preventDefault()">
    Mês
  </button>
</div>
```

### TypeScript (linhas 262-267)

```typescript
effect(() => {
  const tipo = this.tipoPeriodo();
  
  if (tipo === 'intervalo') {
    this.anunciarComLiveAnnouncer('Intervalo selecionado', 'polite');
  } else if (tipo === 'mes') {
    this.anunciarComLiveAnnouncer('Mês selecionado', 'polite');
  }
});
```

**✅ Seu código JÁ ESTÁ CORRETO!**

---

## 🎯 Resumo Final

Para narrar corretamente ao pressionar **Space**:

1. **HTML**: `role="radio"` + `aria-checked` + `aria-label` com estado
2. **Event**: `(keydown.space)="funcao(); $event.preventDefault()"`
3. **TypeScript**: `LiveAnnouncer.announce()` dentro de `effect()`
4. **Timing**: Use `queueMicrotask()` para garantir ordem correta

**Exemplo mínimo funcional:**

```html
<button
  role="radio"
  [attr.aria-checked]="selected() ? 'true' : 'false'"
  [attr.aria-label]="'Opção, ' + (selected() ? 'selecionado' : 'não selecionado')"
  (keydown.space)="select(); $event.preventDefault()">
  Opção
</button>
```

```typescript
select(): void {
  this.selected.set(true);
  this.liveAnnouncer.announce('Opção selecionada', 'polite');
}
```

---

**📚 Referências:**
- [ARIA Practices - Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [Angular CDK A11y](https://material.angular.io/cdk/a11y/overview)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

**✅ Implementado com sucesso em**: `extrato-filtro-figma.component.ts`

