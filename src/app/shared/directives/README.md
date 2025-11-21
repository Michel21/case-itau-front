# Diretivas Compartilhadas

Coleção de diretivas reutilizáveis para melhorar acessibilidade e UX.

## Diretivas Disponíveis

### 1. TabNavigationDirective ⭐ (Recomendada)
Navegação acessível via Tab com scroll automático.

```typescript
import { TabNavigationDirective } from '@shared/directives';
```

```html
<button appTabNavigation>Botão</button>
```

**Funcionalidades:**
- ⭐ **Detecta navegação por Tab/Shift+Tab**
- ✅ Scroll automático e inteligente
- ✅ Anúncios para leitores de tela
- ✅ Suporte a offset para headers fixos
- ✅ Performance otimizada

[📖 Documentação completa](./TAB-NAVIGATION.md)

### 2. ScrollIntoViewDirective
Mantém elementos visíveis na tela durante navegação por teclado.

```typescript
import { ScrollIntoViewDirective } from '@shared/directives';
```

```html
<button appScrollIntoView [scrollBehavior]="'smooth'">
  Botão
</button>
```

**Funcionalidades:**
- ✅ Scroll automático ao receber foco
- ✅ Scroll suave ou instantâneo
- ✅ Posicionamento customizável
- ✅ Suporte a offset para headers fixos
- ✅ Scroll condicional (apenas se necessário)

[📖 Documentação completa](./SCROLL-INTO-VIEW.md)

### 3. FocusTrapDirective
Mantém o foco dentro de um elemento (útil para modais).

```typescript
import { FocusTrapDirective } from '@shared/directives';
```

```html
<div appFocusTrap [trapActive]="isModalOpen">
  <!-- Conteúdo do modal -->
</div>
```

**Funcionalidades:**
- ✅ Captura foco ao ativar
- ✅ Previne foco fora do elemento
- ✅ Suporte a Tab e Shift+Tab
- ✅ Restaura foco ao desativar

## Importação

### Importação individual
```typescript
import { ScrollIntoViewDirective } from '@shared/directives/scroll-into-view.directive';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';
```

### Importação via barrel (index.ts)
```typescript
import { 
  ScrollIntoViewDirective, 
  FocusTrapDirective 
} from '@shared/directives';
```

## Uso em Componentes

### Componente Standalone
```typescript
@Component({
  standalone: true,
  imports: [ScrollIntoViewDirective, FocusTrapDirective]
})
export class MyComponent {}
```

### Módulo
```typescript
@NgModule({
  imports: [ScrollIntoViewDirective, FocusTrapDirective]
})
export class MyModule {}
```

## Exemplos Práticos

### Toggle com navegação suave
```html
@for (option of options; track option.id) {
  <button
    appScrollIntoView
    [scrollBehavior]="'smooth'"
    [scrollBlock]="'nearest'"
    [scrollOnFocus]="true">
    {{ option.label }}
  </button>
}
```

### Modal acessível
```html
<div 
  appFocusTrap 
  [trapActive]="isOpen"
  appScrollIntoView
  [scrollBlock]="'center'"
  class="modal">
  
  <h2>Título do Modal</h2>
  
  <button (click)="close()">Fechar</button>
</div>
```

### Lista longa com scroll inteligente
```html
<div class="lista-container">
  @for (item of items; track item.id) {
    <div
      appScrollIntoView
      [scrollBehavior]="'smooth'"
      [scrollIfNeeded]="true"
      [scrollOffset]="80"
      tabindex="0"
      class="lista-item">
      {{ item.name }}
    </div>
  }
</div>
```

## Padrões de Acessibilidade

Todas as diretivas seguem os padrões:
- ✅ **WCAG 2.1 Level AA**
- ✅ **WAI-ARIA Authoring Practices**
- ✅ **Navegação por teclado**
- ✅ **Suporte a leitores de tela**

## Testes

Todas as diretivas possuem testes unitários com cobertura > 90%.

```bash
# Rodar testes de uma diretiva específica
npm test -- scroll-into-view.directive.spec

# Rodar todos os testes de diretivas
npm test -- directives/
```

## Performance

- ✅ Otimizadas para não causar reflows
- ✅ Cleanup automático de event listeners
- ✅ Uso de `requestAnimationFrame` quando apropriado
- ✅ Verificações de visibilidade eficientes

## Contribuindo

Ao criar novas diretivas:

1. **Criar arquivo da diretiva**
   ```
   src/app/shared/directives/minha-diretiva.directive.ts
   ```

2. **Criar arquivo de teste**
   ```
   src/app/shared/directives/minha-diretiva.directive.spec.ts
   ```

3. **Adicionar ao index.ts**
   ```typescript
   export { MinhaDirective } from './minha-diretiva.directive';
   ```

4. **Criar documentação**
   ```
   src/app/shared/directives/MINHA-DIRETIVA.md
   ```

5. **Atualizar este README**

## Suporte

- 📧 Email: [equipe@exemplo.com](mailto:equipe@exemplo.com)
- 📝 Issues: [GitHub Issues](https://github.com/seu-repo/issues)
- 📚 Docs: [Documentação completa](./docs)

