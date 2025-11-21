# 🔍 Debug do Toggle Intervalo/Mês

## Como Testar se está Funcionando

### 1. Abra o Console do Navegador
```
F12 ou Cmd+Option+I
```

### 2. Acesse a Rota
```
http://localhost:4200/periodo-mobile
```

### 3. Teste os Cliques

#### Ao clicar em "Intervalo":
```
Console deve mostrar:
🔘 Tipo de período mudou para: intervalo
```

**Visual esperado:**
- ✅ Borda azul (2px)
- ✅ Fundo branco
- ✅ Texto azul em negrito
- ✅ Sombra interna sutil (borda dupla)

#### Ao clicar em "Mês":
```
Console deve mostrar:
🔘 Tipo de período mudou para: mes
```

**Visual esperado:**
- ✅ Fundo azul
- ✅ Texto branco em negrito
- ✅ Borda azul

---

## 🐛 Se não estiver funcionando

### Verificação 1: Inputs no HTML
```html
<!-- Devem ter formControlName="tipoPeriodo" -->
<input type="radio" value="intervalo" formControlName="tipoPeriodo">
<input type="radio" value="mes" formControlName="tipoPeriodo">
```

### Verificação 2: FormControl no TypeScript
```typescript
// Deve ter o campo tipoPeriodo
tipoPeriodo: this.fb.control<TipoPeriodo>('mes', ...)
```

### Verificação 3: CSS Selector
```scss
// Deve usar + (adjacent sibling)
.toggle__input:checked + .toggle__label {
  // estilos quando checked
}
```

---

## ✅ Diferença Visual Entre Estados

### "Intervalo" NÃO selecionado:
```
┌────────────────┐
│   Intervalo    │  ← Borda azul 2px
│   texto azul   │  ← Font-weight: 500
│   fundo branco │
└────────────────┘
```

### "Intervalo" SELECIONADO:
```
┏━━━━━━━━━━━━━━━━┓
┃   Intervalo    ┃  ← Borda azul 2px + sombra interna
┃ texto azul bold┃  ← Font-weight: 600 (NEGRITO)
┃   fundo branco ┃
┗━━━━━━━━━━━━━━━━┛
```

### "Mês" NÃO selecionado:
```
┌────────────────┐
│      Mês       │  ← Borda azul 2px
│   texto azul   │  ← Font-weight: 500
│   fundo branco │
└────────────────┘
```

### "Mês" SELECIONADO:
```
┏━━━━━━━━━━━━━━━━┓
┃      Mês       ┃  ← Fundo azul
┃ texto branco B ┃  ← Font-weight: 600 (NEGRITO)
┃   azul total   ┃
┗━━━━━━━━━━━━━━━━┛
```

---

## 🎨 Código CSS Responsável

```scss
// Estado base (NÃO checked)
.toggle__label--outline {
  border: 2px solid blue;
  background: white;
  color: blue;
  font-weight: 500; // Normal
}

// Estado CHECKED para Intervalo
.toggle__input:checked + .toggle__label--outline {
  border: 2px solid blue;
  background: white;
  color: blue;
  box-shadow: inset 0 0 0 1px blue; // Borda dupla
  font-weight: 600; // NEGRITO
}

// Estado CHECKED para Mês
.toggle__input:checked + .toggle__label--filled {
  background: blue;
  color: white;
  font-weight: 600; // NEGRITO
}
```

---

## 🔧 Troubleshooting

### Problema: "Intervalo não mostra diferença quando clico"

**Solução 1:** Verifique se o CSS está carregado
```bash
# No console do navegador
getComputedStyle(document.querySelector('.toggle__label--outline')).fontWeight
```

**Solução 2:** Force reload sem cache
```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

**Solução 3:** Verifique se o input está sendo checked
```javascript
// No console do navegador
document.querySelector('#tipo-intervalo').checked
// Deve retornar: true ou false
```

---

## ✅ Checklist de Funcionamento

- [ ] Console mostra "🔘 Tipo de período mudou para: intervalo"
- [ ] Console mostra "🔘 Tipo de período mudou para: mes"
- [ ] "Intervalo" fica em negrito quando selecionado
- [ ] "Intervalo" tem borda dupla sutil quando selecionado
- [ ] "Mês" fica azul preenchido quando selecionado
- [ ] "Mês" fica branco quando não selecionado
- [ ] Navegação por setas (← →) funciona
- [ ] Tab move entre os radios
- [ ] Space seleciona o radio focado

---

**Se todos os itens acima estiverem ✅, o toggle está funcionando perfeitamente!**

