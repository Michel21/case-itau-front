# Customização de Narração e Navegação - Modal Select Generic

Este documento explica como customizar a narração de itens e o comportamento de navegação no componente `ModalSelectGenericComponent`.

## 📋 Índice

1. [Customização de Narração](#customização-de-narração)
2. [Customização de Navegação](#customização-de-navegação)
3. [Exemplos Completos](#exemplos-completos)

---

## 🎯 Customização de Narração

### 1. Narração de Aria-Label (já existente)

A função `ariaLabelFn` customiza o `aria-label` de cada item:

```typescript
import { ModalSelectGenericComponent, AriaLabelGeneratorFn } from './modal-select-generic.component';

const customAriaLabel: AriaLabelGeneratorFn<string> = (
  option,
  index,
  total,
  isSelected
) => {
  const status = isSelected ? '✓ Selecionado' : '○ Não selecionado';
  return `${option.label} - ${status} (${index + 1}/${total})`;
};

// Uso no template
<app-modal-select-generic
  [isOpen]="isOpen"
  [titulo]="'Selecione um mês'"
  [options]="meses"
  [ariaLabelFn]="customAriaLabel"
  (confirmar)="onConfirmar($event)"
  (cancelar)="onCancelar()">
</app-modal-select-generic>
```

### 2. Narração Durante Navegação (NOVO)

A função `navigationAnnouncementFn` customiza o que é narrado quando o usuário navega pelos itens com as teclas de seta:

```typescript
import { NavigationAnnouncementFn } from './modal-select-generic.component';

const customNavigationAnnouncement: NavigationAnnouncementFn<string> = (
  option,
  index,
  total,
  isSelected,
  navigationKey
) => {
  const direction = navigationKey === 'ArrowDown' ? 'próximo' : 
                   navigationKey === 'ArrowUp' ? 'anterior' : '';
  
  return `${option.label}, ${isSelected ? 'selecionado' : 'não selecionado'}, ${index + 1} de ${total}, ${direction}`;
};

// Uso no template
<app-modal-select-generic
  [isOpen]="isOpen"
  [titulo]="'Selecione um mês'"
  [options]="meses"
  [navigationAnnouncementFn]="customNavigationAnnouncement"
  (confirmar)="onConfirmar($event)"
  (cancelar)="onCancelar()">
</app-modal-select-generic>
```

**Parâmetros:**
- `option`: A opção atual
- `index`: Índice da opção (0-based)
- `total`: Total de opções
- `isSelected`: Se a opção está selecionada
- `navigationKey`: Tecla pressionada (`'ArrowDown'`, `'ArrowUp'`, `'ArrowRight'`, `'ArrowLeft'`, `'Home'`, `'End'`)

---

## 🧭 Customização de Navegação

A função `navigationHandlerFn` permite definir completamente como a navegação funciona:

```typescript
import { NavigationHandlerFn } from './modal-select-generic.component';

const customNavigation: NavigationHandlerFn<string> = (
  key,
  currentIndex,
  total,
  options
) => {
  // Exemplo: Navegação circular
  if (key === 'ArrowDown') {
    return (currentIndex + 1) % total;
  }
  
  if (key === 'ArrowUp') {
    return currentIndex === -1 ? total - 1 : (currentIndex - 1 + total) % total;
  }
  
  if (key === 'Home') {
    return 0;
  }
  
  if (key === 'End') {
    return total - 1;
  }
  
  // Retornar null usa comportamento padrão
  return null;
};

// Uso no template
<app-modal-select-generic
  [isOpen]="isOpen"
  [titulo]="'Selecione um mês'"
  [options]="meses"
  [navigationHandlerFn]="customNavigation"
  (confirmar)="onConfirmar($event)"
  (cancelar)="onCancelar()">
</app-modal-select-generic>
```

**Parâmetros:**
- `key`: Tecla pressionada
- `currentIndex`: Índice atual (-1 se vindo do título)
- `total`: Total de opções
- `options`: Array completo de opções

**Retorno:**
- `number`: Próximo índice a focar
- `null`: Usa comportamento padrão do componente

---

## 📚 Exemplos Completos

### Exemplo 1: Narração Detalhada para Datas

```typescript
import { Component } from '@angular/core';
import { ModalSelectGenericComponent, NavigationAnnouncementFn } from './modal-select-generic.component';

@Component({
  selector: 'app-exemplo-data',
  standalone: true,
  imports: [ModalSelectGenericComponent],
  template: `
    <app-modal-select-generic
      [isOpen]="isOpen"
      [titulo]="'Selecione uma data'"
      [options]="datas"
      [navigationAnnouncementFn]="narracaoData"
      (confirmar)="onConfirmar($event)"
      (cancelar)="onCancelar()">
    </app-modal-select-generic>
  `
})
export class ExemploDataComponent {
  isOpen = signal(true);
  
  datas = [
    { value: '2024-01', label: 'Janeiro 2024' },
    { value: '2024-02', label: 'Fevereiro 2024' },
    // ...
  ];
  
  narracaoData: NavigationAnnouncementFn<string> = (
    option,
    index,
    total,
    isSelected,
    navigationKey
  ) => {
    const mes = option.label.split(' ')[0];
    const ano = option.label.split(' ')[1];
    const posicao = `${index + 1} de ${total}`;
    const status = isSelected ? 'já selecionado' : 'disponível';
    
    return `Mês ${mes} do ano ${ano}, ${posicao}, ${status}`;
  };
  
  onConfirmar(option: any) {
    console.log('Selecionado:', option);
    this.isOpen.set(false);
  }
  
  onCancelar() {
    this.isOpen.set(false);
  }
}
```

### Exemplo 2: Navegação por Grupos

```typescript
const navegacaoPorGrupos: NavigationHandlerFn<string> = (
  key,
  currentIndex,
  total,
  options
) => {
  // Agrupar opções (exemplo: meses por trimestre)
  const grupos = [
    { inicio: 0, fim: 2 },   // Q1
    { inicio: 3, fim: 5 },   // Q2
    { inicio: 6, fim: 8 },   // Q3
    { inicio: 9, fim: 11 }   // Q4
  ];
  
  if (key === 'ArrowRight') {
    // Ir para próximo grupo
    const grupoAtual = grupos.findIndex(g => 
      currentIndex >= g.inicio && currentIndex <= g.fim
    );
    
    if (grupoAtual < grupos.length - 1) {
      return grupos[grupoAtual + 1].inicio;
    }
  }
  
  if (key === 'ArrowLeft') {
    // Ir para grupo anterior
    const grupoAtual = grupos.findIndex(g => 
      currentIndex >= g.inicio && currentIndex <= g.fim
    );
    
    if (grupoAtual > 0) {
      return grupos[grupoAtual - 1].inicio;
    }
  }
  
  // Para outras teclas, usar comportamento padrão
  return null;
};
```

### Exemplo 3: Combinando Todas as Customizações

```typescript
@Component({
  selector: 'app-exemplo-completo',
  standalone: true,
  imports: [ModalSelectGenericComponent],
  template: `
    <app-modal-select-generic
      [isOpen]="isOpen"
      [titulo]="'Selecione uma opção'"
      [options]="opcoes"
      [ariaLabelFn]="customAriaLabel"
      [navigationAnnouncementFn]="customNavigationAnnouncement"
      [navigationHandlerFn]="customNavigation"
      (confirmar)="onConfirmar($event)"
      (cancelar)="onCancelar()">
    </app-modal-select-generic>
  `
})
export class ExemploCompletoComponent {
  isOpen = signal(true);
  opcoes = [
    { value: 'op1', label: 'Opção 1' },
    { value: 'op2', label: 'Opção 2' },
    // ...
  ];
  
  // Customizar aria-label
  customAriaLabel: AriaLabelGeneratorFn<string> = (option, index, total, isSelected) => {
    return `${option.label} - ${isSelected ? 'Selecionado' : 'Não selecionado'}`;
  };
  
  // Customizar narração durante navegação
  customNavigationAnnouncement: NavigationAnnouncementFn<string> = (
    option, index, total, isSelected, navigationKey
  ) => {
    return `Navegando para ${option.label}`;
  };
  
  // Customizar comportamento de navegação
  customNavigation: NavigationHandlerFn<string> = (key, currentIndex, total, options) => {
    // Sua lógica customizada aqui
    return null; // null = usar padrão
  };
  
  onConfirmar(option: any) {
    console.log('Confirmado:', option);
    this.isOpen.set(false);
  }
  
  onCancelar() {
    this.isOpen.set(false);
  }
}
```

---

## ✅ Resumo

| Função | Quando é Usada | Parâmetros | Retorno |
|--------|----------------|------------|---------|
| `ariaLabelFn` | Define `aria-label` do item | `(option, index, total, isSelected)` | `string` |
| `navigationAnnouncementFn` | Narração durante navegação | `(option, index, total, isSelected, navigationKey)` | `string` |
| `navigationHandlerFn` | Comportamento de navegação | `(key, currentIndex, total, options)` | `number \| null` |

---

## 🎯 Boas Práticas

1. **Narração Clara**: Use linguagem clara e concisa
2. **Contexto**: Inclua informações relevantes (posição, status, etc.)
3. **Navegação Intuitiva**: Mantenha comportamento previsível
4. **Fallback**: Retorne `null` em `navigationHandlerFn` para usar padrão quando necessário
5. **Testes**: Teste com leitores de tela (NVDA, JAWS, VoiceOver)

---

## 🔍 Debug

Para debugar as customizações, você pode adicionar `console.log` nas funções:

```typescript
const customNavigationAnnouncement: NavigationAnnouncementFn<string> = (
  option, index, total, isSelected, navigationKey
) => {
  const message = `${option.label} - ${index + 1}/${total}`;
  console.log('Narração:', message, 'Tecla:', navigationKey);
  return message;
};
```

