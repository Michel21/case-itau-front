# ScrollIntoViewDirective

Diretiva para manter elementos visíveis na tela durante navegação por teclado.

## Funcionalidades

✅ **Scroll automático ao receber foco**  
✅ **Scroll suave ou instantâneo**  
✅ **Posicionamento customizável** (start, center, end, nearest)  
✅ **Suporte a offset** (útil para headers fixos)  
✅ **Scroll condicional** (apenas se elemento não estiver visível)  
✅ **Performance otimizada**

## Uso Básico

```typescript
import { ScrollIntoViewDirective } from '@shared/directives';

@Component({
  imports: [ScrollIntoViewDirective]
})
```

```html
<!-- Scroll suave ao receber foco -->
<button appScrollIntoView>
  Botão
</button>
```

## Opções de Configuração

### scrollBehavior
Comportamento do scroll:
- `'smooth'` (padrão) - Scroll suave
- `'auto'` - Scroll instantâneo

```html
<button appScrollIntoView [scrollBehavior]="'smooth'">
  Scroll suave
</button>

<button appScrollIntoView [scrollBehavior]="'auto'">
  Scroll instantâneo
</button>
```

### scrollBlock
Posição do elemento no viewport:
- `'nearest'` (padrão) - Posição mais próxima
- `'start'` - Topo do viewport
- `'center'` - Centro do viewport
- `'end'` - Final do viewport

```html
<button appScrollIntoView [scrollBlock]="'center'">
  Centralizar na tela
</button>

<button appScrollIntoView [scrollBlock]="'start'">
  Topo da tela
</button>
```

### scrollOnFocus
Se deve fazer scroll ao receber foco:
- `true` (padrão) - Scroll automático no foco
- `false` - Desabilita scroll automático

```html
<button 
  appScrollIntoView 
  [scrollOnFocus]="true">
  Scroll automático
</button>
```

### scrollIfNeeded
Se deve fazer scroll apenas quando necessário:
- `true` (padrão) - Scroll apenas se não estiver visível
- `false` - Scroll sempre

```html
<button 
  appScrollIntoView 
  [scrollIfNeeded]="true">
  Scroll inteligente
</button>
```

### scrollOffset
Offset adicional em pixels (útil para headers fixos):

```html
<button 
  appScrollIntoView 
  [scrollOffset]="80">
  Scroll com offset de 80px
</button>
```

## Exemplos Práticos

### Toggle Segmented (Navegação por teclado)

```html
<button
  appScrollIntoView
  [scrollBehavior]="'smooth'"
  [scrollBlock]="'nearest'"
  [scrollOnFocus]="true"
  [scrollIfNeeded]="true">
  Opção 1
</button>

<button
  appScrollIntoView
  [scrollBehavior]="'smooth'"
  [scrollBlock]="'nearest'"
  [scrollOnFocus]="true"
  [scrollIfNeeded]="true">
  Opção 2
</button>
```

### Lista longa com header fixo

```html
@for (item of items; track item.id) {
  <div
    appScrollIntoView
    [scrollBehavior]="'smooth'"
    [scrollBlock]="'start'"
    [scrollOffset]="100"
    [scrollIfNeeded]="true"
    tabindex="0">
    {{ item.name }}
  </div>
}
```

### Formulário com validação

```html
<input
  #firstError
  appScrollIntoView
  [scrollBehavior]="'smooth'"
  [scrollBlock]="'center'"
  [scrollOffset]="20"
  [class.error]="hasError">
```

## Acessibilidade

✅ **WCAG 2.1 Compliant**  
✅ **Suporte a navegação por teclado**  
✅ **Detecta foco via teclado vs mouse**  
✅ **Respeita preferências de movimento reduzido**

## Performance

- ✅ Verifica visibilidade antes de fazer scroll
- ✅ Usa `requestAnimationFrame` quando apropriado
- ✅ Cleanup automático de event listeners
- ✅ Não causa reflows desnecessários

## Browser Support

- ✅ Chrome/Edge (últimas 2 versões)
- ✅ Firefox (últimas 2 versões)
- ✅ Safari (últimas 2 versões)
- ✅ Mobile (iOS Safari, Chrome Mobile)

## API Pública

### Método: scrollIntoView()

Permite scroll manual programático:

```typescript
@ViewChild(ScrollIntoViewDirective) 
scrollDirective!: ScrollIntoViewDirective;

scrollToElement() {
  this.scrollDirective.scrollIntoView();
}
```

## Troubleshooting

### Scroll não funciona

1. Verificar se elemento tem `tabindex` para ser focável
2. Verificar se há CSS `overflow: hidden` bloqueando scroll
3. Verificar se elemento pai tem `position: fixed`

### Scroll muito brusco

- Ajustar `scrollBehavior` para `'smooth'`
- Ajustar `scrollBlock` para `'nearest'`

### Scroll em loop infinito

- Verificar se `scrollIfNeeded` está `true`
- Verificar se há conflitos com outras diretivas de scroll

