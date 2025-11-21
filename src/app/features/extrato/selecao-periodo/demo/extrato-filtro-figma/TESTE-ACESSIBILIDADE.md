# 🧪 Guia de Testes de Acessibilidade

## 📋 Índice

1. [Ferramentas Necessárias](#ferramentas-necessárias)
2. [Testes com Leitores de Tela](#testes-com-leitores-de-tela)
3. [Testes de Navegação por Teclado](#testes-de-navegação-por-teclado)
4. [Testes Automatizados](#testes-automatizados)
5. [Testes de Contraste](#testes-de-contraste)
6. [Checklist de Validação](#checklist-de-validação)

---

## 🛠️ Ferramentas Necessárias

### Leitores de Tela

#### **Windows**
```bash
# NVDA (Gratuito e recomendado)
https://www.nvaccess.org/download/

# JAWS (Pago)
https://www.freedomscientific.com/products/software/jaws/
```

#### **macOS**
```bash
# VoiceOver (Nativo - já instalado)
Ativar: Cmd + F5
ou
System Preferences > Accessibility > VoiceOver
```

#### **Linux**
```bash
# Orca (Gratuito)
sudo apt-get install orca
```

#### **iOS**
```
Settings > Accessibility > VoiceOver
```

#### **Android**
```
Settings > Accessibility > TalkBack
```

### Extensões Chrome/Edge

```bash
# axe DevTools
https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility/lhdoppojpmngadmnindnejefpokejbdd

# Lighthouse
https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk

# WAVE
https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh

# Accessibility Insights
https://accessibilityinsights.io/downloads/
```

---

## 🔊 Testes com Leitores de Tela

### 1. Teste com NVDA (Windows)

#### **Instalação e Ativação**

```bash
1. Baixe NVDA: https://www.nvaccess.org/download/
2. Instale e execute
3. NVDA iniciará automaticamente
```

#### **Comandos Básicos NVDA**

| Ação | Comando |
|------|---------|
| Ligar/Desligar | `Ctrl + Alt + N` |
| Ler próximo elemento | `↓` (seta para baixo) |
| Ler elemento anterior | `↑` (seta para cima) |
| Ler tudo | `Insert + ↓` |
| Parar leitura | `Ctrl` |
| Próximo link | `K` |
| Próximo botão | `B` |
| Próximo formulário | `F` |
| Próximo cabeçalho | `H` |
| Próximo landmark | `D` |

#### **Script de Teste NVDA**

```markdown
🧪 TESTE 1: Navegação Sequencial
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Abra http://localhost:4200/demo/extrato-filtro
2. Pressione Ctrl + Home (ir ao topo)
3. Pressione ↓ repetidamente

ESPERADO:
✅ "Voltar, botão"
✅ "Investimentos, título nível 1"
✅ "Para visualizar o extrato, escolha o período, título nível 2"
✅ "É possível consultar lançamentos dos últimos 12 meses"
✅ "Tipo de período, grupo"
✅ "Intervalo, botão de opção, não selecionado, 1 de 2"
✅ "Mês, botão de opção, selecionado, 2 de 2"
✅ "Mês, caixa de combinação, obrigatório"
✅ "Ano, edição, obrigatório"
✅ "Aplicar filtro, botão, indisponível"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 2: Seleção de Radio Button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Navegue até "Intervalo"
2. Pressione Espaço

ESPERADO:
✅ "Intervalo, selecionado, 1 de 2"
✅ LIVE REGION: "Intervalo selecionado"

3. Pressione ↓ ou Tab
4. Pressione Espaço em "Mês"

ESPERADO:
✅ "Mês, selecionado, 2 de 2"
✅ LIVE REGION: "Mês selecionado"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 3: Preenchimento de Formulário
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Navegue até campo "Mês"
2. Pressione Alt + ↓ (abrir dropdown)
3. Pressione ↓ até "Janeiro"
4. Pressione Enter

ESPERADO:
✅ "Janeiro, selecionado"
✅ Foco move automaticamente para "Ano"

5. Digite "2025"

ESPERADO:
✅ "2, 0, 2, 5" (lê cada dígito)
✅ LIVE REGION: "Formulário válido. Período selecionado: Janeiro de 2025. Botão aplicar filtro disponível"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 4: Validação de Erro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Limpe o campo "Ano"
2. Pressione Tab

ESPERADO:
✅ "Ano, edição, inválido, obrigatório"
✅ "Campo obrigatório" (mensagem de erro)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 5: Botão Desabilitado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Com formulário incompleto, navegue até botão
2. Pressione ↓

ESPERADO:
✅ "Aplicar filtro, botão, indisponível"

3. Preencha formulário
4. Navegue até botão novamente

ESPERADO:
✅ "Aplicar filtro, botão"
```

---

### 2. Teste com VoiceOver (macOS)

#### **Ativação**

```bash
Cmd + F5
ou
System Preferences > Accessibility > VoiceOver > Enable
```

#### **Comandos Básicos VoiceOver**

| Ação | Comando |
|------|---------|
| VO = `Ctrl + Option` | - |
| Próximo item | `VO + →` |
| Item anterior | `VO + ←` |
| Interagir com elemento | `VO + Shift + ↓` |
| Parar interação | `VO + Shift + ↑` |
| Ler tudo | `VO + A` |
| Rotor | `VO + U` |

#### **Script de Teste VoiceOver**

```markdown
🧪 TESTE 1: Navegação com Rotor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Pressione VO + U (abrir Rotor)
2. Use ← → para navegar entre categorias
3. Selecione "Headings"

ESPERADO:
✅ "Investimentos, heading level 1"
✅ "Para visualizar o extrato..., heading level 2"

4. Selecione "Form Controls"

ESPERADO:
✅ "Intervalo, radio button, 1 of 2, not selected"
✅ "Mês, radio button, 2 of 2, selected"
✅ "Mês, combo box, required"
✅ "Ano, edit text, required"
✅ "Aplicar filtro, button, dimmed"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 2: Anúncios Automáticos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Selecione radio "Intervalo"

ESPERADO:
✅ "Intervalo, selected"
✅ VoiceOver anuncia: "Intervalo selecionado"

2. Preencha formulário completo

ESPERADO:
✅ VoiceOver anuncia: "Formulário válido. Período selecionado: Janeiro de 2025"
```

---

## ⌨️ Testes de Navegação por Teclado

### Checklist de Navegação

```markdown
🧪 TESTE 1: Tab Order (Ordem de Tabulação)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Pressione Tab repetidamente

ESPERADO:
✅ Tab 1: Botão "Voltar" (foco visível)
✅ Tab 2: Skip (título não é focável)
✅ Tab 3: Radio "Intervalo"
✅ Tab 4: Radio "Mês"
✅ Tab 5: Select "Mês"
✅ Tab 6: Input "Ano"
✅ Tab 7: Botão "Aplicar filtro"

2. Pressione Shift + Tab (voltar)

ESPERADO:
✅ Ordem inversa funciona corretamente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 2: Interação com Radio Buttons
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Foque em radio "Intervalo"
2. Pressione Espaço

ESPERADO:
✅ "Intervalo" selecionado
✅ Visual feedback (cor azul)

3. Pressione ↓ ou →

ESPERADO:
✅ Foco move para "Mês"
✅ "Mês" automaticamente selecionado

4. Pressione ↑ ou ←

ESPERADO:
✅ Foco volta para "Intervalo"
✅ "Intervalo" automaticamente selecionado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 3: Interação com Select
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Foque no select "Mês"
2. Pressione Alt + ↓ (Windows) ou Espaço (Mac)

ESPERADO:
✅ Dropdown abre

3. Pressione ↓ ↑ para navegar

ESPERADO:
✅ Opções destacam visualmente

4. Pressione Enter

ESPERADO:
✅ Opção selecionada
✅ Foco move automaticamente para "Ano"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 4: Submit do Formulário
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Preencha formulário
2. Pressione Tab até botão
3. Pressione Enter ou Espaço

ESPERADO:
✅ Formulário submetido
✅ Console mostra dados

ALTERNATIVA:
1. Preencha formulário
2. Pressione Enter em qualquer campo

ESPERADO:
✅ Formulário submetido (Enter funciona em qualquer lugar do form)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE 5: Escape / Esc (Opcional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Abra select "Mês"
2. Pressione Esc

ESPERADO:
✅ Dropdown fecha
✅ Foco permanece no select
```

---

## 🤖 Testes Automatizados

### 1. axe DevTools (Chrome Extension)

```markdown
📍 INSTALAÇÃO:
https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility/lhdoppojpmngadmnindnejefpokejbdd

📍 USO:
1. Abra http://localhost:4200/demo/extrato-filtro
2. Abra DevTools (F12)
3. Vá para aba "axe DevTools"
4. Clique "Scan ALL of my page"

ESPERADO:
✅ 0 Critical Issues
✅ 0 Serious Issues
✅ Possíveis alertas menores (informational)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 VERIFICAR:

✅ Form labels
   • "All form elements have labels"

✅ Color contrast
   • "Text has sufficient contrast"

✅ ARIA attributes
   • "ARIA attributes are valid"

✅ Keyboard access
   • "All interactive elements are keyboard accessible"

✅ Focus visible
   • "Focus indicator is visible"
```

### 2. Lighthouse (Chrome DevTools)

```markdown
📍 USO:
1. Abra http://localhost:4200/demo/extrato-filtro
2. Abra DevTools (F12)
3. Vá para aba "Lighthouse"
4. Selecione "Accessibility"
5. Clique "Generate report"

ESPERADO:
✅ Score: 95-100
✅ Sem erros críticos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 MÉTRICAS:

✅ ARIA attributes (100%)
✅ Names and labels (100%)
✅ Contrast (100%)
✅ Tables and lists (N/A)
✅ Best practices (100%)
```

### 3. WAVE (Web Accessibility Evaluation Tool)

```markdown
📍 INSTALAÇÃO:
https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh

📍 USO:
1. Abra http://localhost:4200/demo/extrato-filtro
2. Clique no ícone WAVE na barra do navegador

ESPERADO:
✅ 0 Errors (vermelho)
✅ 0 Contrast Errors (rosa)
✅ Possíveis Alerts (amarelo) - revisar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 VERIFICAR:

ESTRUTURA:
✅ Headings em ordem (h1 > h2)
✅ Landmarks presentes (header, main)
✅ Labels associados corretamente

ARIA:
✅ aria-required nos campos obrigatórios
✅ aria-invalid nos campos com erro
✅ aria-live regions presentes

FORMULÁRIO:
✅ Todos campos têm labels
✅ Fieldset/legend para radio group
✅ Estados visuais claros
```

### 4. Accessibility Insights for Web

```markdown
📍 INSTALAÇÃO:
https://accessibilityinsights.io/downloads/

📍 USO:
1. Instale a extensão
2. Abra http://localhost:4200/demo/extrato-filtro
3. Clique no ícone Accessibility Insights
4. Selecione "FastPass"

ESPERADO:
✅ 0 Failures
✅ All checks pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 TESTES:

AUTOMATED CHECKS:
✅ Tab stops (Tab order correto)
✅ Needs review (revisar manualmente)

ASSESSMENT:
✅ Keyboard interaction
✅ Screen reader compatibility
✅ Visual design (contraste, foco)
```

---

## 🎨 Testes de Contraste

### Ferramentas Online

```markdown
📍 WebAIM Contrast Checker:
https://webaim.org/resources/contrastchecker/

📍 Colour Contrast Analyser:
https://www.tpgi.com/color-contrast-checker/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTE MANUAL:

HEADER (Azul):
• Background: #3b82f6
• Text: #ffffff
• WCAG AA: ✅ PASSA (4.5:1 mínimo)
• WCAG AAA: ✅ PASSA (7:1 mínimo)

LABELS:
• Background: #ffffff
• Text: #6b7280
• WCAG AA: ✅ PASSA (4.5:1)

BOTÃO PRIMÁRIO:
• Background: #3b82f6
• Text: #ffffff
• WCAG AA: ✅ PASSA

BOTÃO DESABILITADO:
• Background: #e5e7eb
• Text: #9ca3af
• WCAG AA: ⚠️ Verificar (pode não passar)
• Nota: Botões desabilitados podem ter contraste menor

ERRO:
• Background: transparent
• Text: #ef4444
• WCAG AA: ✅ PASSA (sobre fundo branco)
```

---

## ✅ Checklist de Validação Final

### HTML Semântico

```markdown
✅ <header> presente
✅ <main> presente
✅ <h1> único e descritivo
✅ <h2> para subtítulos
✅ <form> para formulário
✅ <fieldset> + <legend> para radio group
✅ <label for="id"> associados
✅ <button type="submit"> para ação
```

### ARIA Attributes

```markdown
✅ lang="pt-BR" no container
✅ role="radiogroup" no fieldset
✅ aria-setsize="2" nos radios
✅ aria-posinset="1/2" nos radios
✅ aria-checked dinâmico nos radios
✅ aria-required="true" nos campos obrigatórios
✅ aria-invalid dinâmico nos campos
✅ aria-describedby nos campos com erro
✅ aria-disabled dinâmico no botão
✅ aria-label dinâmico no botão
✅ aria-labelledby no radiogroup
✅ role="status" para live region
✅ role="alert" para erros
✅ aria-live="polite" para anúncios
✅ aria-live="assertive" para erros
✅ aria-atomic="true" na live region
```

### Navegação por Teclado

```markdown
✅ Tab order lógico
✅ Shift + Tab funciona
✅ Espaço seleciona radio
✅ Setas ↑↓ navegam entre radios
✅ Enter submete formulário
✅ Select abre com Alt + ↓ ou Espaço
✅ Setas navegam no select
✅ Esc fecha select
✅ Foco visível em todos elementos
✅ Nenhuma armadilha de foco (focus trap)
```

### Estados Visuais

```markdown
✅ :focus-visible implementado
✅ :hover estados claros
✅ :active estados claros
✅ :disabled com opacity
✅ .invalid com border vermelha
✅ .valid com feedback visual
✅ Radio selecionado destacado
✅ Select dropdown estilizado
```

### Live Regions

```markdown
✅ Anunciam seleção de radio
✅ Anunciam formulário válido
✅ Anunciam erros de validação
✅ Anunciam botão habilitado
✅ Não anunciam excessivamente
✅ Timing adequado (queueMicrotask)
```

### Leitores de Tela

```markdown
✅ NVDA: ordem correta
✅ NVDA: posição no grupo ("1 de 2")
✅ NVDA: estados corretos
✅ VoiceOver: rotor funcional
✅ VoiceOver: anúncios funcionam
✅ TalkBack: navegação funcional (testar em Android)
```

### Ferramentas Automatizadas

```markdown
✅ axe DevTools: 0 issues críticos
✅ Lighthouse: score 95+
✅ WAVE: 0 errors
✅ Accessibility Insights: all pass
```

---

## 🎯 Matriz de Testes

### Prioridade Alta (Crítico)

| Teste | Ferramenta | Status |
|-------|-----------|--------|
| Navegação por Tab | Manual | ⬜ |
| NVDA leitura completa | NVDA | ⬜ |
| VoiceOver rotor | VoiceOver | ⬜ |
| axe DevTools scan | axe | ⬜ |
| Lighthouse score | Lighthouse | ⬜ |

### Prioridade Média (Importante)

| Teste | Ferramenta | Status |
|-------|-----------|--------|
| Navegação por setas | Manual | ⬜ |
| WAVE scan | WAVE | ⬜ |
| Contraste de cores | WebAIM | ⬜ |
| Estados visuais | Manual | ⬜ |
| Live regions | NVDA/VO | ⬜ |

### Prioridade Baixa (Desejável)

| Teste | Ferramenta | Status |
|-------|-----------|--------|
| TalkBack (Android) | TalkBack | ⬜ |
| JAWS | JAWS | ⬜ |
| Accessibility Insights | AI | ⬜ |
| Mobile VO (iOS) | VoiceOver | ⬜ |

---

## 📝 Relatório de Testes

```markdown
# RELATÓRIO DE ACESSIBILIDADE
Data: _____________
Testador: _____________

## RESUMO

| Categoria | Score | Notas |
|-----------|-------|-------|
| HTML Semântico | __/10 | |
| ARIA Attributes | __/10 | |
| Navegação Teclado | __/10 | |
| Leitores de Tela | __/10 | |
| Contraste | __/10 | |
| Ferramentas Auto | __/10 | |
| **TOTAL** | **__/60** | |

## ISSUES ENCONTRADOS

### Crítico
- [ ] Issue 1: _____________
- [ ] Issue 2: _____________

### Importante
- [ ] Issue 1: _____________
- [ ] Issue 2: _____________

### Menor
- [ ] Issue 1: _____________
- [ ] Issue 2: _____________

## RECOMENDAÇÕES

1. _____________
2. _____________
3. _____________

## CONCLUSÃO

✅ APROVADO para produção
⚠️ APROVADO com ressalvas
❌ REPROVADO - necessita correções
```

---

## 🚀 Quick Start (Teste Rápido)

```bash
# 1. TESTE AUTOMÁTICO RÁPIDO (5 min)
1. Abra http://localhost:4200/demo/extrato-filtro
2. F12 > Lighthouse > Accessibility > Generate report
   ESPERADO: Score 95+

# 2. TESTE DE TECLADO (3 min)
1. Tab 7x (verificar ordem)
2. Preencha formulário apenas com teclado
   ESPERADO: Tudo funciona

# 3. TESTE DE LEITOR (10 min - se tiver NVDA/VO)
1. Ative leitor de tela
2. Navegue Tab por Tab
3. Preencha formulário
   ESPERADO: Todos anúncios corretos

TOTAL: 18 minutos
```

---

## 📚 Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

**Última atualização:** 2025-01-09  
**Versão:** 1.0  
**Autor:** Equipe de Acessibilidade

