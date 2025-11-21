# 🔊 Como Narrar o Estado "Não Selecionado" em Inputs

## 📋 Guia Completo de Narração de Estados

Este documento explica como fazer leitores de tela narrarem corretamente o estado "não selecionado" em diferentes tipos de inputs.

---

## 🎯 Tipos de Inputs e Como Narrar

### 1️⃣ **Radio Buttons** (Botões de Opção)

#### ✅ **Implementação Correta:**

```html
<fieldset role="radiogroup" aria-labelledby="tipo-periodo-label">
  <legend id="tipo-periodo-label" class="visually-hidden">Tipo de período</legend>

  <!-- Radio 1 - NÃO selecionado -->
  <label>
    <input
      type="radio"
      id="tipo-intervalo"
      name="tipoPeriodo"
      value="intervalo"
      tabindex="0"
      [attr.aria-checked]="tipoPeriodo() === 'intervalo'"
      aria-setsize="2"
      aria-posinset="1"
    />
    <span>Intervalo</span>
  </label>

  <!-- Radio 2 - SELECIONADO -->
  <label>
    <input
      type="radio"
      id="tipo-mes"
      name="tipoPeriodo"
      value="mes"
      checked
      tabindex="0"
      [attr.aria-checked]="tipoPeriodo() === 'mes'"
      aria-setsize="2"
      aria-posinset="2"
    />
    <span>Mês</span>
  </label>
</fieldset>
```

#### 🔊 **O que o Leitor de Tela Narra:**

```
NVDA (Windows):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Radio 1 (NÃO selecionado):
🔊 "Intervalo, botão de opção, não selecionado, 1 de 2"

Radio 2 (SELECIONADO):
🔊 "Mês, botão de opção, selecionado, 2 de 2"

VoiceOver (macOS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Radio 1 (NÃO selecionado):
🔊 "Intervalo, button, 1 of 2, radio button, unchecked"

Radio 2 (SELECIONADO):
🔊 "Mês, button, 2 of 2, radio button, checked"
```

#### ⚠️ **Atributos Essenciais:**

| Atributo | Obrigatório | Função |
|----------|-------------|--------|
| `type="radio"` | ✅ Sim | Define como radio button |
| `name="..."` | ✅ Sim | Agrupa radios (mesmo nome) |
| `checked` | ❌ Não | Marca como selecionado |
| `aria-checked` | ✅ Sim | Estado dinâmico ("true"/"false") |
| `aria-setsize` | ✅ Sim | Total de itens no grupo (ex: "2") |
| `aria-posinset` | ✅ Sim | Posição no grupo (ex: "1" de 2) |
| `role="radiogroup"` | ✅ Sim | No container pai |

---

### 2️⃣ **Checkboxes** (Caixas de Seleção)

#### ✅ **Implementação Correta:**

```html
<fieldset>
  <legend>Opções de filtro</legend>

  <!-- Checkbox 1 - NÃO selecionado -->
  <label>
    <input
      type="checkbox"
      id="renda-fixa"
      name="rendaFixa"
      tabindex="0"
      [attr.aria-checked]="rendaFixa()"
      aria-describedby="renda-fixa-desc"
    />
    <span>Incluir Renda Fixa</span>
  </label>
  <span id="renda-fixa-desc" class="visually-hidden">
    Adiciona operações de renda fixa ao extrato
  </span>

  <!-- Checkbox 2 - SELECIONADO -->
  <label>
    <input
      type="checkbox"
      id="renda-variavel"
      name="rendaVariavel"
      checked
      tabindex="0"
      [attr.aria-checked]="rendaVariavel()"
      aria-describedby="renda-variavel-desc"
    />
    <span>Incluir Renda Variável</span>
  </label>
  <span id="renda-variavel-desc" class="visually-hidden">
    Adiciona operações de renda variável ao extrato
  </span>
</fieldset>
```

#### 🔊 **O que o Leitor de Tela Narra:**

```
NVDA (Windows):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Checkbox 1 (NÃO selecionado):
🔊 "Incluir Renda Fixa, caixa de seleção, não marcado"
🔊 "Adiciona operações de renda fixa ao extrato"

Checkbox 2 (SELECIONADO):
🔊 "Incluir Renda Variável, caixa de seleção, marcado"
🔊 "Adiciona operações de renda variável ao extrato"

VoiceOver (macOS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Checkbox 1 (NÃO selecionado):
🔊 "Incluir Renda Fixa, checkbox, unchecked"
🔊 "Adds fixed income operations to statement"

Checkbox 2 (SELECIONADO):
🔊 "Incluir Renda Variável, checkbox, checked"
🔊 "Adds variable income operations to statement"
```

#### ⚠️ **Atributos Essenciais:**

| Atributo | Obrigatório | Função |
|----------|-------------|--------|
| `type="checkbox"` | ✅ Sim | Define como checkbox |
| `checked` | ❌ Não | Marca como selecionado |
| `aria-checked` | ✅ Sim | Estado dinâmico ("true"/"false") |
| `aria-describedby` | 🟡 Recomendado | Link para descrição adicional |

---

### 3️⃣ **Select / Dropdown** (Campo de Seleção)

#### ✅ **Implementação Correta:**

```html
<div class="form-field">
  <label class="form-field__label" for="campo-mes">
    Mês
  </label>
  <select
    id="campo-mes"
    class="form-field__select"
    formControlName="mes"
    tabindex="0"
    required
    aria-required="true"
    [attr.aria-invalid]="!!getMensagemErro('mes')"
    [attr.aria-describedby]="getMensagemErro('mes') ? 'erro-mes' : null"
  >
    <!-- Placeholder - Estado "não selecionado" -->
    <option value="" disabled selected hidden>Selecione</option>
    
    <!-- Opções -->
    <option value="01">Janeiro</option>
    <option value="02">Fevereiro</option>
    <option value="03">Março</option>
    <!-- ... -->
  </select>
  
  @if (getMensagemErro('mes'); as erro) {
    <span id="erro-mes" class="form-field__error" role="alert" aria-live="assertive">
      {{ erro }}
    </span>
  }
</div>
```

#### 🔊 **O que o Leitor de Tela Narra:**

```
NVDA (Windows):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado INICIAL (não selecionado):
🔊 "Mês, caixa de combinação, Selecione, obrigatório"

Ao abrir o dropdown:
🔊 "Selecione" (placeholder)
🔊 "Janeiro"
🔊 "Fevereiro"
🔊 "Março"

Após selecionar "Janeiro":
🔊 "Janeiro, selecionado"

VoiceOver (macOS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado INICIAL (não selecionado):
🔊 "Mês, combo box, required, Selecione"

Após selecionar:
🔊 "Janeiro, selected"
```

#### ⚠️ **Atributos Essenciais:**

| Atributo | Obrigatório | Função |
|----------|-------------|--------|
| `<select>` | ✅ Sim | Define dropdown nativo |
| `required` | 🟡 Se obrigatório | Marca como obrigatório |
| `aria-required` | ✅ Sim | Anuncia como obrigatório |
| `aria-invalid` | 🟡 Se inválido | Marca como inválido |
| `aria-describedby` | 🟡 Se há erro | Link para mensagem de erro |
| `<option value="">` | ✅ Sim | Placeholder (disabled, selected, hidden) |

---

### 4️⃣ **Input Text / Number** (Campo de Texto)

#### ✅ **Implementação Correta:**

```html
<div class="form-field">
  <label class="form-field__label" for="campo-ano">
    Ano
  </label>
  <input
    id="campo-ano"
    type="text"
    inputmode="numeric"
    pattern="[0-9]{4}"
    minlength="4"
    maxlength="4"
    placeholder="Ex: 2025"
    class="form-field__input"
    formControlName="ano"
    tabindex="0"
    required
    aria-required="true"
    [attr.aria-invalid]="!!getMensagemErro('ano')"
    [attr.aria-describedby]="getMensagemErro('ano') ? 'erro-ano' : null"
    autocomplete="off"
  />
  
  @if (getMensagemErro('ano'); as erro) {
    <span id="erro-ano" class="form-field__error" role="alert" aria-live="assertive">
      {{ erro }}
    </span>
  }
</div>
```

#### 🔊 **O que o Leitor de Tela Narra:**

```
NVDA (Windows):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado INICIAL (vazio/não preenchido):
🔊 "Ano, edição, obrigatório, Ex: 2025"

Ao digitar "2":
🔊 "2"

Ao digitar "0":
🔊 "0"

Campo preenchido completo "2025":
🔊 "2, 0, 2, 5"

VoiceOver (macOS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado INICIAL:
🔊 "Ano, edit text, required, Ex: 2025"

Ao digitar:
🔊 "2" (cada caractere é narrado)
```

#### ⚠️ **Atributos Essenciais:**

| Atributo | Obrigatório | Função |
|----------|-------------|--------|
| `type="text"` | ✅ Sim | Define campo de texto |
| `placeholder` | 🟡 Recomendado | Dica visual (narrada!) |
| `required` | 🟡 Se obrigatório | Marca como obrigatório |
| `aria-required` | ✅ Sim | Anuncia como obrigatório |
| `aria-invalid` | 🟡 Se inválido | Marca como inválido |
| `aria-describedby` | 🟡 Se há erro | Link para mensagem de erro |

---

## 🎯 Como Narrar Estados de Validação

### ✅ **Estado: Campo Vazio (Não Preenchido)**

```html
<!-- Campo obrigatório vazio -->
<input
  id="campo-cpf"
  type="text"
  required
  aria-required="true"
  aria-invalid="false"
  placeholder="000.000.000-00"
/>
```

#### 🔊 **Narração:**
```
NVDA: "CPF, edição, obrigatório, 000.000.000-00"
VoiceOver: "CPF, edit text, required, 000.000.000-00"
```

---

### ❌ **Estado: Campo Inválido**

```html
<!-- Campo com erro de validação -->
<div class="form-field form-field--invalid">
  <label for="campo-cpf">CPF</label>
  <input
    id="campo-cpf"
    type="text"
    required
    aria-required="true"
    aria-invalid="true"
    aria-describedby="erro-cpf"
    value="123"
  />
  <span id="erro-cpf" role="alert" aria-live="assertive">
    CPF inválido. Digite 11 dígitos.
  </span>
</div>
```

#### 🔊 **Narração:**
```
NVDA: "CPF, edição, obrigatório, inválido, 123"
      "CPF inválido. Digite 11 dígitos." (anunciado automaticamente)

VoiceOver: "CPF, edit text, required, invalid entry, 123"
           "Alert: CPF inválido. Digite 11 dígitos."
```

---

### ✅ **Estado: Campo Válido (Preenchido Corretamente)**

```html
<!-- Campo validado com sucesso -->
<div class="form-field form-field--valid">
  <label for="campo-cpf">CPF</label>
  <input
    id="campo-cpf"
    type="text"
    required
    aria-required="true"
    aria-invalid="false"
    value="123.456.789-00"
  />
</div>
```

#### 🔊 **Narração:**
```
NVDA: "CPF, edição, obrigatório, 123.456.789-00"

VoiceOver: "CPF, edit text, required, 123.456.789-00"
```

---

## 🔄 Como Anunciar Mudanças de Estado Dinamicamente

### **1️⃣ Usando Live Regions (Anúncios Automáticos)**

```typescript
// TypeScript (Component)
export class FormComponent {
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  onSelectionChange(valor: string): void {
    if (valor) {
      // Anuncia quando selecionado
      this.liveAnnouncer.announce(
        `${valor} selecionado`,
        'polite'
      );
    } else {
      // Anuncia quando desmarcado/limpo
      this.liveAnnouncer.announce(
        'Campo limpo. Nenhum valor selecionado',
        'polite'
      );
    }
  }
}
```

```html
<!-- HTML -->
<select
  (change)="onSelectionChange($event.target.value)"
  aria-label="Selecione um mês">
  <option value="">Selecione</option>
  <option value="Janeiro">Janeiro</option>
  <option value="Fevereiro">Fevereiro</option>
</select>

<!-- Live region oculta (gerenciada pelo LiveAnnouncer) -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  <!-- Mensagens são inseridas aqui automaticamente -->
</div>
```

#### 🔊 **Narração:**
```
Ao selecionar "Janeiro":
🔊 "Janeiro, selecionado"
🔊 LIVE REGION: "Janeiro selecionado"

Ao limpar (selecionar "Selecione"):
🔊 "Selecione"
🔊 LIVE REGION: "Campo limpo. Nenhum valor selecionado"
```

---

### **2️⃣ Usando aria-checked Dinâmico (Radio/Checkbox)**

```html
<!-- Radio button com estado dinâmico -->
<input
  type="radio"
  id="opcao-1"
  name="opcoes"
  value="1"
  [attr.aria-checked]="opcaoSelecionada() === '1' ? 'true' : 'false'"
  (change)="onOpcaoChange('1')"
/>
```

```typescript
export class FormComponent {
  opcaoSelecionada = signal<string>('');

  onOpcaoChange(valor: string): void {
    this.opcaoSelecionada.set(valor);
    // aria-checked é atualizado automaticamente via [attr.aria-checked]
  }
}
```

#### 🔊 **Narração:**
```
ANTES (não selecionado):
🔊 "Opção 1, botão de opção, não selecionado"

DEPOIS (selecionado):
🔊 "Opção 1, botão de opção, selecionado"
```

---

## 📊 Resumo: Estados e Como Narrá-los

| Tipo | Estado | HTML | ARIA | Narração |
|------|--------|------|------|----------|
| **Radio** | Não selecionado | (sem `checked`) | `aria-checked="false"` | "não selecionado" |
| **Radio** | Selecionado | `checked` | `aria-checked="true"` | "selecionado" |
| **Checkbox** | Não marcado | (sem `checked`) | `aria-checked="false"` | "não marcado" |
| **Checkbox** | Marcado | `checked` | `aria-checked="true"` | "marcado" |
| **Select** | Vazio | `<option value="">` | - | "Selecione" (placeholder) |
| **Select** | Selecionado | `<option selected>` | - | "Janeiro, selecionado" |
| **Input** | Vazio | (sem `value`) | `aria-invalid="false"` | "edição, obrigatório" |
| **Input** | Preenchido | `value="..."` | `aria-invalid="false"` | "edição, 2025" |
| **Input** | Inválido | `value="..."` | `aria-invalid="true"` | "edição, inválido" |

---

## 🛠️ Ferramenta: Como Testar a Narração

### **Windows (NVDA):**

```bash
1. Instale NVDA: https://www.nvaccess.org/
2. Ctrl + Alt + N para ativar
3. Tab para navegar entre campos
4. Espaço para marcar/desmarcar
5. ↑↓ para navegar em radio buttons
```

### **macOS (VoiceOver):**

```bash
1. Cmd + F5 para ativar
2. VO + → (Ctrl + Option + →) para navegar
3. VO + Espaço para ativar
4. VO + ↑↓ para navegar em grupos
```

### **DevTools (Chrome):**

```bash
1. F12 para abrir DevTools
2. Aba "Elements"
3. Clique direito no elemento
4. "Accessibility" → "Computed Properties"
5. Veja: Name, Role, State
```

---

## ✅ Checklist de Acessibilidade

### **Radio Buttons:**
- [ ] `type="radio"` presente
- [ ] `name` igual para todos do grupo
- [ ] `aria-checked` dinâmico
- [ ] `aria-setsize` e `aria-posinset`
- [ ] `role="radiogroup"` no container
- [ ] `tabindex="0"` em todos
- [ ] Narra "selecionado" / "não selecionado"

### **Checkboxes:**
- [ ] `type="checkbox"` presente
- [ ] `aria-checked` dinâmico
- [ ] `aria-describedby` se houver descrição
- [ ] Narra "marcado" / "não marcado"

### **Select:**
- [ ] `<option value="">` como placeholder
- [ ] `aria-required` se obrigatório
- [ ] `aria-invalid` se inválido
- [ ] `aria-describedby` se houver erro
- [ ] Narra valor selecionado ou "Selecione"

### **Input:**
- [ ] `placeholder` informativo
- [ ] `aria-required` se obrigatório
- [ ] `aria-invalid` dinâmico
- [ ] `aria-describedby` para erros
- [ ] Narra estado "vazio" / "preenchido" / "inválido"

---

## 🎯 Exemplo Completo: Formulário Acessível

```html
<form [formGroup]="filtroForm" (ngSubmit)="aplicarFiltro()">
  
  <!-- 1. Radio Buttons -->
  <fieldset role="radiogroup" aria-labelledby="tipo-label">
    <legend id="tipo-label">Tipo de período</legend>
    
    <label>
      <input
        type="radio"
        name="tipo"
        value="intervalo"
        formControlName="tipo"
        [attr.aria-checked]="tipo() === 'intervalo'"
        aria-setsize="2"
        aria-posinset="1"
      />
      Intervalo
    </label>
    
    <label>
      <input
        type="radio"
        name="tipo"
        value="mes"
        formControlName="tipo"
        [attr.aria-checked]="tipo() === 'mes'"
        aria-setsize="2"
        aria-posinset="2"
      />
      Mês
    </label>
  </fieldset>

  <!-- 2. Select -->
  <div class="form-field">
    <label for="mes">Mês</label>
    <select
      id="mes"
      formControlName="mes"
      required
      aria-required="true"
      [attr.aria-invalid]="!!erroMes()"
      [attr.aria-describedby]="erroMes() ? 'erro-mes' : null"
    >
      <option value="" disabled selected hidden>Selecione</option>
      <option value="01">Janeiro</option>
      <option value="02">Fevereiro</option>
    </select>
    
    @if (erroMes(); as erro) {
      <span id="erro-mes" role="alert" aria-live="assertive">
        {{ erro }}
      </span>
    }
  </div>

  <!-- 3. Input -->
  <div class="form-field">
    <label for="ano">Ano</label>
    <input
      id="ano"
      type="text"
      formControlName="ano"
      placeholder="Ex: 2025"
      required
      aria-required="true"
      [attr.aria-invalid]="!!erroAno()"
      [attr.aria-describedby]="erroAno() ? 'erro-ano' : null"
    />
    
    @if (erroAno(); as erro) {
      <span id="erro-ano" role="alert" aria-live="assertive">
        {{ erro }}
      </span>
    }
  </div>

  <!-- 4. Submit -->
  @if (!formularioValido()) {
    <div
      role="button"
      tabindex="0"
      aria-disabled="true"
      aria-describedby="botao-status"
      class="btn-disabled">
      Aplicar filtro
    </div>
    <span id="botao-status" class="visually-hidden">
      Botão desabilitado. Preencha todos os campos obrigatórios.
    </span>
  } @else {
    <button type="submit">
      Aplicar filtro
    </button>
  }
</form>
```

---

## 🔗 Referências

- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/
- **MDN - ARIA:** https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- **Angular CDK A11y:** https://material.angular.io/cdk/a11y/overview

---

**Versão:** 1.0  
**Data:** 2025-01-11  
**Status:** Guia completo de narração de estados

