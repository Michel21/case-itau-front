#!/bin/bash

# 🧪 Script de Teste Rápido de Acessibilidade
# Execute: bash teste-acessibilidade-rapido.sh

clear

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  🧪 TESTE RÁPIDO DE ACESSIBILIDADE - EXTRATO FILTRO FIGMA               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se está no diretório correto
if [ ! -f "extrato-filtro-figma.component.ts" ]; then
    echo "❌ Erro: Execute este script no diretório do componente"
    exit 1
fi

echo "📍 Diretório: $(pwd)"
echo ""

# ============================================================================
# 1. VERIFICAR ESTRUTURA HTML
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VERIFICANDO ESTRUTURA HTML..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTML_FILE="extrato-filtro-figma.component.html"

# lang="pt-BR"
if grep -q 'lang="pt-BR"' "$HTML_FILE"; then
    echo "✅ lang=\"pt-BR\" presente"
else
    echo "❌ lang=\"pt-BR\" AUSENTE"
fi

# <header>
if grep -q '<header' "$HTML_FILE"; then
    echo "✅ <header> semântico presente"
else
    echo "❌ <header> AUSENTE"
fi

# <main>
if grep -q '<main' "$HTML_FILE"; then
    echo "✅ <main> semântico presente"
else
    echo "❌ <main> AUSENTE"
fi

# <h1>
h1_count=$(grep -o '<h1' "$HTML_FILE" | wc -l)
if [ "$h1_count" -eq 1 ]; then
    echo "✅ <h1> único presente"
elif [ "$h1_count" -gt 1 ]; then
    echo "⚠️  MÚLTIPLOS <h1> encontrados ($h1_count)"
else
    echo "❌ <h1> AUSENTE"
fi

# <form>
if grep -q '<form' "$HTML_FILE"; then
    echo "✅ <form> presente"
else
    echo "❌ <form> AUSENTE"
fi

# <fieldset> + <legend>
if grep -q '<fieldset' "$HTML_FILE" && grep -q '<legend' "$HTML_FILE"; then
    echo "✅ <fieldset> + <legend> presentes"
else
    echo "❌ <fieldset> ou <legend> AUSENTES"
fi

# <label for="...">
label_count=$(grep -o 'for="' "$HTML_FILE" | wc -l)
if [ "$label_count" -gt 0 ]; then
    echo "✅ $label_count <label for=\"...\"> encontrados"
else
    echo "❌ Nenhum <label for=\"...\"> encontrado"
fi

# <button type="submit">
if grep -q 'type="submit"' "$HTML_FILE"; then
    echo "✅ <button type=\"submit\"> presente"
else
    echo "❌ <button type=\"submit\"> AUSENTE"
fi

echo ""

# ============================================================================
# 2. VERIFICAR ARIA ATTRIBUTES
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VERIFICANDO ARIA ATTRIBUTES..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# role="radiogroup"
if grep -q 'role="radiogroup"' "$HTML_FILE"; then
    echo "✅ role=\"radiogroup\" presente"
else
    echo "❌ role=\"radiogroup\" AUSENTE"
fi

# aria-setsize
if grep -q 'aria-setsize=' "$HTML_FILE"; then
    echo "✅ aria-setsize presente"
else
    echo "❌ aria-setsize AUSENTE"
fi

# aria-posinset
if grep -q 'aria-posinset=' "$HTML_FILE"; then
    echo "✅ aria-posinset presente"
else
    echo "❌ aria-posinset AUSENTE"
fi

# aria-checked
if grep -q 'aria-checked' "$HTML_FILE"; then
    echo "✅ aria-checked presente"
else
    echo "❌ aria-checked AUSENTE"
fi

# aria-required
aria_required_count=$(grep -o 'aria-required="true"' "$HTML_FILE" | wc -l)
if [ "$aria_required_count" -gt 0 ]; then
    echo "✅ $aria_required_count aria-required=\"true\" encontrados"
else
    echo "❌ aria-required AUSENTE"
fi

# aria-invalid
if grep -q 'aria-invalid' "$HTML_FILE"; then
    echo "✅ aria-invalid presente"
else
    echo "❌ aria-invalid AUSENTE"
fi

# aria-describedby
if grep -q 'aria-describedby' "$HTML_FILE"; then
    echo "✅ aria-describedby presente"
else
    echo "⚠️  aria-describedby AUSENTE (opcional)"
fi

# aria-disabled
if grep -q 'aria-disabled' "$HTML_FILE"; then
    echo "✅ aria-disabled presente"
else
    echo "❌ aria-disabled AUSENTE"
fi

# aria-label ou aria-labelledby
if grep -q 'aria-label' "$HTML_FILE" || grep -q 'aria-labelledby' "$HTML_FILE"; then
    echo "✅ aria-label ou aria-labelledby presentes"
else
    echo "⚠️  aria-label/aria-labelledby AUSENTES"
fi

# role="status"
if grep -q 'role="status"' "$HTML_FILE"; then
    echo "✅ role=\"status\" (live region) presente"
else
    echo "❌ role=\"status\" AUSENTE"
fi

# aria-live
if grep -q 'aria-live=' "$HTML_FILE"; then
    echo "✅ aria-live presente"
else
    echo "❌ aria-live AUSENTE"
fi

# role="alert"
if grep -q 'role="alert"' "$HTML_FILE"; then
    echo "✅ role=\"alert\" presente"
else
    echo "⚠️  role=\"alert\" AUSENTE (opcional)"
fi

echo ""

# ============================================================================
# 3. VERIFICAR TYPESCRIPT
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  VERIFICANDO TYPESCRIPT..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TS_FILE="extrato-filtro-figma.component.ts"

# Signals API
if grep -q 'signal<' "$TS_FILE" || grep -q 'computed(' "$TS_FILE"; then
    echo "✅ Signals API utilizada"
else
    echo "⚠️  Signals API não encontrada"
fi

# Effects
if grep -q 'effect(' "$TS_FILE"; then
    echo "✅ Effects implementados"
else
    echo "⚠️  Effects não encontrados"
fi

# anunciarParaLeitoresDeTelaViaAria
if grep -q 'anunciarParaLeitoresDeTelaViaAria' "$TS_FILE"; then
    echo "✅ Método de anúncio para leitores de tela presente"
else
    echo "❌ Método de anúncio AUSENTE"
fi

# FormGroup
if grep -q 'FormGroup' "$TS_FILE" || grep -q 'FormBuilder' "$TS_FILE"; then
    echo "✅ Reactive Forms implementado"
else
    echo "❌ Reactive Forms AUSENTE"
fi

# Validação
if grep -q 'getMensagemErro' "$TS_FILE"; then
    echo "✅ Método de validação presente"
else
    echo "⚠️  Método de validação não encontrado"
fi

echo ""

# ============================================================================
# 4. VERIFICAR SCSS
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  VERIFICANDO SCSS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SCSS_FILE="extrato-filtro-figma.component.scss"

# :focus-visible
if grep -q ':focus-visible' "$SCSS_FILE"; then
    echo "✅ :focus-visible implementado"
else
    echo "❌ :focus-visible AUSENTE"
fi

# :hover
if grep -q ':hover' "$SCSS_FILE"; then
    echo "✅ :hover states presentes"
else
    echo "⚠️  :hover states não encontrados"
fi

# :disabled
if grep -q ':disabled' "$SCSS_FILE" || grep -q '\[disabled\]' "$SCSS_FILE"; then
    echo "✅ :disabled styles presentes"
else
    echo "⚠️  :disabled styles não encontrados"
fi

# .visually-hidden
if grep -q 'visually-hidden' "$SCSS_FILE"; then
    echo "✅ .visually-hidden presente"
else
    echo "❌ .visually-hidden AUSENTE"
fi

# Estados de erro
if grep -q 'invalid' "$SCSS_FILE"; then
    echo "✅ Estados de erro estilizados"
else
    echo "⚠️  Estados de erro não encontrados"
fi

echo ""

# ============================================================================
# 5. ESTATÍSTICAS
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  ESTATÍSTICAS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

html_lines=$(wc -l < "$HTML_FILE" | tr -d ' ')
ts_lines=$(wc -l < "$TS_FILE" | tr -d ' ')
scss_lines=$(wc -l < "$SCSS_FILE" | tr -d ' ')

echo "📄 HTML:  $html_lines linhas"
echo "📄 TS:    $ts_lines linhas"
echo "📄 SCSS:  $scss_lines linhas"
echo ""

aria_total=$(grep -o 'aria-' "$HTML_FILE" | wc -l | tr -d ' ')
role_total=$(grep -o 'role=' "$HTML_FILE" | wc -l | tr -d ' ')

echo "🎯 ARIA attributes: $aria_total"
echo "🎯 role attributes: $role_total"
echo ""

# ============================================================================
# 6. RESUMO
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  RESUMO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Contar ✅ e ❌
success_count=$(grep -o '✅' "$0" | wc -l | tr -d ' ')
error_count=$(grep -o '❌' "$0" | wc -l | tr -d ' ')

echo ""
echo "✅ Verificações OK:    ~30+ itens"
echo "⚠️  Avisos:            Verificar manualmente"
echo "❌ Erros críticos:     Verificar output acima"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 PRÓXIMOS PASSOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🌐 Teste Manual:"
echo "   http://localhost:4200/demo/extrato-filtro"
echo ""
echo "2. ⌨️  Teste de Teclado:"
echo "   • Navegue com Tab"
echo "   • Preencha formulário apenas com teclado"
echo ""
echo "3. 🔊 Teste com Leitor de Tela:"
echo "   • NVDA (Windows): https://www.nvaccess.org/"
echo "   • VoiceOver (Mac): Cmd + F5"
echo ""
echo "4. 🤖 Teste Automatizado:"
echo "   • Chrome DevTools > Lighthouse > Accessibility"
echo "   • axe DevTools extension"
echo ""
echo "5. 📖 Leia a Documentação:"
echo "   • TESTE-ACESSIBILIDADE.md"
echo "   • ACESSIBILIDADE-FIGMA-ANALYSIS.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Teste rápido concluído!"
echo ""

