# ⌨️ Navegação por Teclado no macOS com VoiceOver

## 🎯 Guia Completo de Atalhos e Navegação

---

## 1️⃣ Ativar/Desativar VoiceOver

| Ação | Atalho |
|------|--------|
| **Ligar/Desligar VoiceOver** | `⌘ Cmd + F5` |
| **Abrir Utilitário VoiceOver** | `⌘ Cmd + F8` |
| **Bloquear/Desbloquear teclas VO** | `Ctrl + Option + ;` |

> **💡 Dica:** `Ctrl + Option` é chamado de **teclas VO** (VoiceOver)

---

## 2️⃣ Navegação Básica (SEM VoiceOver)

### Navegação entre Elementos

| Ação | Atalho |
|------|--------|
| **Próximo elemento focável** | `Tab` |
| **Elemento anterior** | `⇧ Shift + Tab` |
| **Ativar botão/link** | `Space` ou `Enter` |
| **Fechar janela/diálogo** | `Esc` |

### Navegação em Formulários

| Ação | Atalho |
|------|--------|
| **Próximo campo** | `Tab` |
| **Campo anterior** | `⇧ Shift + Tab` |
| **Abrir select/dropdown** | `Space` ou `↓ Seta Baixo` |
| **Navegar em select** | `↑ ↓ Setas` |
| **Confirmar seleção** | `Enter` |

### Rolagem de Página

| Ação | Atalho |
|------|--------|
| **Rolar para baixo** | `Space` |
| **Rolar para cima** | `⇧ Shift + Space` |
| **Página abaixo** | `Fn + ↓ Seta Baixo` |
| **Página acima** | `Fn + ↑ Seta Cima` |
| **Início da página** | `⌘ Cmd + ↑ Seta Cima` |
| **Fim da página** | `⌘ Cmd + ↓ Seta Baixo` |

> **⚠️ Atenção:** No Mac, as teclas `Page Up` e `Page Down` são:
> - **Page Down** = `Fn + ↓`
> - **Page Up** = `Fn + ↑`

---

## 3️⃣ Navegação COM VoiceOver (Teclas VO)

> **Teclas VO** = `Ctrl + Option`

### Navegação por Elementos

| Ação | Atalho |
|------|--------|
| **Próximo item** | `Ctrl + Option + →` |
| **Item anterior** | `Ctrl + Option + ←` |
| **Entrar em grupo/área** | `Ctrl + Option + ⇧ Shift + ↓` |
| **Sair de grupo/área** | `Ctrl + Option + ⇧ Shift + ↑` |
| **Próximo controle** | `Ctrl + Option + ⇥ Tab` |
| **Controle anterior** | `Ctrl + Option + ⇧ Shift + ⇥ Tab` |

### Leitura de Conteúdo

| Ação | Atalho |
|------|--------|
| **Ler item atual** | `Ctrl + Option + A` |
| **Ler tudo desde cursor** | `Ctrl + Option + A A` (dois A) |
| **Parar leitura** | `Ctrl` |
| **Ler linha atual** | `Ctrl + Option + L` |
| **Ler palavra atual** | `Ctrl + Option + W` |
| **Ler caractere atual** | `Ctrl + Option + C` |

### Interação com Elementos

| Ação | Atalho |
|------|--------|
| **Ativar item** | `Ctrl + Option + Space` |
| **Clicar no item** | `Ctrl + Option + Space` |
| **Menu de ações** | `Ctrl + Option + ⌘ Cmd + Space` |
| **Abrir rotor** | `Ctrl + Option + U` |

### Rotor (Navegação Rápida)

| Ação | Atalho |
|------|--------|
| **Abrir rotor** | `Ctrl + Option + U` |
| **Navegar no rotor** | `← →` (setas) |
| **Selecionar categoria** | `↑ ↓` (setas) |
| **Ir para item** | `Enter` |

**Categorias do Rotor:**
- 🔗 Links
- 📋 Formulários
- 🏷️ Títulos (H1, H2, H3...)
- 🔘 Botões
- 🖼️ Imagens
- 📊 Tabelas
- 🗺️ Landmarks/Regiões

---

## 4️⃣ Navegação Específica por Tipo de Elemento

### Radio Buttons (Botões de Rádio)

| Ação | Atalho | O que faz |
|------|--------|-----------|
| **Focar grupo** | `Tab` | Foca no radiogroup |
| **Próxima opção** | `↓` ou `→` | Move para próximo radio |
| **Opção anterior** | `↑` ou `←` | Move para radio anterior |
| **Selecionar** | `Space` | Marca a opção |

**✅ Exemplo do seu código:**
```html
<!-- Ao focar no radiogroup -->
Tab → Foca "Intervalo"

<!-- Navegar entre opções -->
→ ou ↓ → Foca "Mês"
← ou ↑ → Volta para "Intervalo"

<!-- Selecionar -->
Space → Marca "Mês" como selecionado
```

### Checkboxes

| Ação | Atalho |
|------|--------|
| **Focar checkbox** | `Tab` |
| **Marcar/desmarcar** | `Space` |

### Select/Dropdown

| Ação | Atalho |
|------|--------|
| **Abrir dropdown** | `Space` ou `↓` |
| **Navegar opções** | `↑ ↓` |
| **Selecionar** | `Enter` |
| **Fechar sem selecionar** | `Esc` |

### Botões

| Ação | Atalho |
|------|--------|
| **Ativar botão** | `Space` ou `Enter` |
| **Botão padrão em diálogo** | `Enter` |
| **Cancelar/Fechar** | `Esc` |

---

## 5️⃣ Navegação Rápida no VoiceOver

### Quick Nav (Navegação Rápida)

| Ação | Atalho |
|------|--------|
| **Ativar/Desativar Quick Nav** | `← →` (setas esq + dir juntas) |

**Quando Quick Nav está ATIVO:**

| Elemento | Atalho |
|----------|--------|
| **Próximo título** | `H` |
| **Título anterior** | `⇧ Shift + H` |
| **Próximo link** | `L` |
| **Link anterior** | `⇧ Shift + L` |
| **Próximo botão** | `B` |
| **Botão anterior** | `⇧ Shift + B` |
| **Próximo formulário** | `C` |
| **Formulário anterior** | `⇧ Shift + C` |
| **Próxima tabela** | `T` |
| **Tabela anterior** | `⇧ Shift + T` |
| **Próximo landmark** | `W` |
| **Landmark anterior** | `⇧ Shift + W` |

---

## 6️⃣ Navegação em Páginas Web

### Chrome/Safari com VoiceOver

| Ação | Atalho |
|------|--------|
| **Próximo elemento** | `Ctrl + Option + →` |
| **Elemento anterior** | `Ctrl + Option + ←` |
| **Próximo título (H1-H6)** | `Ctrl + Option + ⌘ Cmd + H` |
| **Próximo link** | `Ctrl + Option + ⌘ Cmd + L` |
| **Próxima tabela** | `Ctrl + Option + ⌘ Cmd + T` |
| **Próximo formulário** | `Ctrl + Option + ⌘ Cmd + J` |
| **Lista de links** | `Ctrl + Option + U` → `→` |
| **Lista de títulos** | `Ctrl + Option + U` → `→ →` |

---

## 7️⃣ Atalhos do Sistema macOS

### Gerenciamento de Janelas

| Ação | Atalho |
|------|--------|
| **Trocar aplicativo** | `⌘ Cmd + Tab` |
| **Trocar janela** | `⌘ Cmd + ~` |
| **Minimizar janela** | `⌘ Cmd + M` |
| **Fechar janela** | `⌘ Cmd + W` |
| **Sair do app** | `⌘ Cmd + Q` |
| **Spotlight** | `⌘ Cmd + Space` |
| **Mission Control** | `Ctrl + ↑` |

### Navegação no Finder

| Ação | Atalho |
|------|--------|
| **Ir para pasta** | `⌘ Cmd + ⇧ Shift + G` |
| **Nova janela** | `⌘ Cmd + N` |
| **Nova pasta** | `⌘ Cmd + ⇧ Shift + N` |
| **Apagar** | `⌘ Cmd + Delete` |

---

## 8️⃣ Navegação no seu Formulário de Extrato

### Fluxo Completo de Navegação

```
┌─────────────────────────────────────────────────┐
│ 1. Botão Voltar                                 │ ← Tab 1
│ 2. Título "Investimentos"                       │ ← Tab 2
│ 3. Radiogroup:                                  │
│    → Radio "Intervalo" (1 de 2)                │ ← Tab 3
│    → Radio "Mês" (2 de 2)                      │ ← Seta →
│ 4. Select "Mês"                                 │ ← Tab 4
│ 5. Input "Ano"                                  │ ← Tab 5
│ 6. Botão "Aplicar filtro"                       │ ← Tab 6
└─────────────────────────────────────────────────┘
```

### Passo a Passo

#### 1️⃣ **Navegar até Radiogroup**
```
Tab → Tab → Tab
Você ouve: "Tipo de período, grupo de opções"
```

#### 2️⃣ **Selecionar "Intervalo"**
```
Space (já está focado)
Você ouve: "Intervalo, selecionado, 1 de 2, botão de opção"
```

#### 3️⃣ **Mudar para "Mês"**
```
→ (Seta Direita) ou ↓ (Seta Baixo)
Você ouve: "Mês, não selecionado, 2 de 2, botão de opção"

Space (para selecionar)
Você ouve: "Mês, selecionado, 2 de 2, botão de opção"
```

#### 4️⃣ **Preencher Mês**
```
Tab (vai para o select de mês)
Space ou ↓ (abre dropdown)
↓ ↓ ↓ (navega para "Março", por exemplo)
Enter (confirma)
```

#### 5️⃣ **Preencher Ano**
```
Tab (vai para o campo Ano - automático!)
2025 (digita)
```

#### 6️⃣ **Aplicar Filtro**
```
Tab (vai para o botão)
Enter ou Space (submete formulário)
```

---

## 9️⃣ Atalhos Personalizados do seu Componente

### Atalhos Implementados

| Ação | Atalho | Descrição |
|------|--------|-----------|
| **Limpar formulário** | `Esc` | Reseta todos os campos |
| **Submeter formulário** | `⌘ Cmd + Enter` ou `Ctrl + Enter` | Aplica filtro |

**💡 Código correspondente (linhas 315-334):**
```typescript
@HostListener('document:keydown.escape')
onEscapeKey() {
  this.limparFormulario();
}

@HostListener('document:keydown.control.enter')
@HostListener('document:keydown.meta.enter')
onCtrlEnter() {
  this.aplicarFiltro();
}
```

---

## 🔟 Dicas de Acessibilidade

### ✅ Boas Práticas Implementadas no Seu Código

1. **`role="radiogroup"`** - Agrupa radio buttons semanticamente
2. **`aria-labelledby`** - Associa label ao grupo
3. **`aria-checked`** - Indica estado de seleção
4. **`aria-label` dinâmico** - Inclui estado "selecionado/não selecionado"
5. **`aria-posinset` e `aria-setsize`** - Informa posição (1 de 2)
6. **`tabindex="0"`** - Inclui no fluxo de teclado
7. **Setas `← →` funcionam** - Navegação nativa de radiogroup

### 🎯 Como Testar Cada Elemento

#### **Radio Buttons:**
```bash
Tab → Foca no grupo
→ ↓ ← ↑ → Navega entre opções
Space → Seleciona
```

#### **Select/Dropdown:**
```bash
Tab → Foca no select
Space ou ↓ → Abre
↑ ↓ → Navega
Enter → Confirma
Esc → Cancela
```

#### **Input Text:**
```bash
Tab → Foca no input
Digite → Preenche
Tab → Vai para próximo
```

#### **Botão:**
```bash
Tab → Foca no botão
Space ou Enter → Ativa
```

---

## 1️⃣1️⃣ Equivalência de Teclas Mac vs Windows/Linux

| Função | macOS | Windows/Linux |
|--------|-------|---------------|
| **Page Down** | `Fn + ↓` | `Page Down` |
| **Page Up** | `Fn + ↑` | `Page Up` |
| **Home** | `⌘ Cmd + ←` ou `Fn + ←` | `Home` |
| **End** | `⌘ Cmd + →` ou `Fn + →` | `End` |
| **Delete** | `Fn + Delete` | `Delete` |
| **Backspace** | `Delete` | `Backspace` |

---

## 1️⃣2️⃣ Troubleshooting

### ❓ "As setas não mudam o radio button"

**Solução:**
- Certifique-se de que `role="radiogroup"` está no elemento pai
- Verifique se os botões têm `role="radio"`
- Teste com Quick Nav DESATIVADO (`← →` juntas para desativar)

### ❓ "VoiceOver não narra 'selecionado'"

**Solução:**
- Verifique se `aria-checked="true"` está correto
- Confirme que `aria-label` tem o texto "selecionado"
- Use `aria-live` se precisar anunciar mudanças

### ❓ "Tab pula o radiogroup"

**Solução:**
- Adicione `tabindex="0"` no primeiro radio
- Use `tabindex="-1"` nos demais (opcional, para navegação por setas)

---

## 📚 Resumo Rápido

### Navegação Essencial no Mac

```
Tab              → Próximo elemento
⇧ Shift + Tab   → Elemento anterior
Space           → Ativar/Selecionar
Enter           → Confirmar/Enviar
Esc             → Cancelar/Fechar
Fn + ↓          → Page Down
Fn + ↑          → Page Up
⌘ Cmd + F5      → Ligar/Desligar VoiceOver
```

### VoiceOver Essencial

```
Ctrl + Option + →     → Próximo item
Ctrl + Option + ←     → Item anterior
Ctrl + Option + Space → Ativar item
Ctrl + Option + A     → Ler item
Ctrl + Option + U     → Abrir rotor
← →                   → Ativar Quick Nav
```

---

## 🎓 Recursos Adicionais

- [Apple VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WebAIM VoiceOver Guide](https://webaim.org/articles/voiceover/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

---

**✅ Seu formulário já está 100% navegável por teclado!** 🎉

Pressione `Tab` 3 vezes → `→` → `Space` → `Tab` → preencher → `⌘ Cmd + Enter` 🚀

