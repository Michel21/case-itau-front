# 🐛 Debug do Toggle - Passo a Passo

## 1️⃣ Teste o HTML Puro Primeiro

Abra este arquivo no navegador:
```
file:///Users/michelangelisaraujo/case-itau-front/src/app/features/extrato/selecao-periodo/periodo-mobile/teste-radio.html
```

### O que deve acontecer:
1. ✅ Ao clicar em "Mês" → Fica AZUL PREENCHIDO
2. ✅ Ao clicar em "Intervalo" → "Mês" volta BRANCO

### Se funcionar:
- ✅ O CSS está correto
- ❌ O problema está no Angular (FormControl)

### Se NÃO funcionar:
- ❌ O problema é no CSS
- Verifique se o seletor `input:checked + label` está correto

---

## 2️⃣ Verifique o FormControl no Angular

Abra o console no navegador (F12) em:
```
http://localhost:4200/periodo-mobile
```

Execute:
```javascript
// Pegar o componente
const el = document.querySelector('app-periodo-mobile');
const comp = ng.getComponent(el);

// Ver o valor do formulário
console.log('Form value:', comp.filtroForm.value);

// Ver o estado do tipoPeriodo
console.log('Tipo período:', comp.tipoPeriodo());

// Mudar manualmente para "mes"
comp.filtroForm.patchValue({ tipoPeriodo: 'mes' });

// Verificar se mudou
console.log('Depois da mudança:', comp.filtroForm.value);
```

---

## 3️⃣ Verifique se o Input Está Sendo Checked

No console:
```javascript
// Verificar inputs
const intervalo = document.querySelector('#tipo-intervalo');
const mes = document.querySelector('#tipo-mes');

console.log('Intervalo checked:', intervalo.checked);
console.log('Mês checked:', mes.checked);

// Tentar marcar manualmente
mes.checked = true;
console.log('Depois de marcar:', mes.checked);

// Ver o estilo do label
const mesLabel = document.querySelector('label[for="tipo-mes"]');
const style = window.getComputedStyle(mesLabel);
console.log('Background:', style.backgroundColor);
console.log('Color:', style.color);
```

---

## 4️⃣ Verificar se o CSS Está Carregado

No console:
```javascript
// Ver todas as regras CSS
const sheets = Array.from(document.styleSheets);
sheets.forEach(sheet => {
  try {
    const rules = Array.from(sheet.cssRules || []);
    rules.forEach(rule => {
      if (rule.selectorText && rule.selectorText.includes('toggle__input:checked')) {
        console.log('✅ Regra encontrada:', rule.selectorText);
        console.log('Estilos:', rule.style.cssText);
      }
    });
  } catch(e) {
    // CORS pode bloquear
  }
});
```

---

## 5️⃣ Solução Alternativa: Usar [class] Binding

Se o `:checked` CSS não funcionar, use class binding do Angular:

### HTML:
```html
<input type="radio" #intervaloRadio formControlName="tipoPeriodo" value="intervalo">
<label [class.active]="tipoPeriodo() === 'intervalo'">Intervalo</label>

<input type="radio" #mesRadio formControlName="tipoPeriodo" value="mes">
<label [class.active]="tipoPeriodo() === 'mes'">Mês</label>
```

### CSS:
```scss
.toggle__label--filled.active {
  background-color: #0046C0 !important;
  color: white !important;
}
```

---

## 6️⃣ Checklist de Debug

Execute cada item e marque:

- [ ] O HTML puro (`teste-radio.html`) funciona?
- [ ] O `console.log` mostra mudança no `tipoPeriodo()`?
- [ ] O input está sendo marcado (`checked = true`)?
- [ ] O seletor CSS `:checked` está no CSS compilado?
- [ ] O `background-color` muda ao inspecionar no DevTools?
- [ ] Forçar `!important` resolve?

---

## 7️⃣ Solução Definitiva

Se nada funcionar, vou criar com buttons + class binding:

```html
<button 
  type="button"
  [class.active]="tipoPeriodo() === 'intervalo'"
  (click)="selecionarPeriodo('intervalo')">
  Intervalo
</button>

<button 
  type="button"
  [class.active]="tipoPeriodo() === 'mes'"
  (click)="selecionarPeriodo('mes')">
  Mês
</button>
```

Isso é 100% confiável e funciona em qualquer situação.

---

**Execute o passo 1 primeiro e me diga o resultado!** 🔍

