# Controle Personalizado de Narração - Modal Select Generic

## Visão Geral

O componente `ModalSelectGenericComponent` agora oferece controle total sobre as narrações de acessibilidade via JavaScript/Angular, permitindo customizar completamente o que é narrado para leitores de tela.

## Métodos Disponíveis

### 1. `announceCustomMessage(message: string, priority?: 'assertive' | 'polite')`

Anuncia uma mensagem customizada para leitores de tela.

**Parâmetros:**
- `message`: Mensagem a ser narrada
- `priority`: Prioridade da narração (padrão: 'assertive')
  - `'assertive'`: Interrompe o que está sendo narrado
  - `'polite'`: Aguarda a narração atual terminar

**Exemplo:**
```typescript
// No componente que usa o modal
@ViewChild(ModalSelectGenericComponent) modal!: ModalSelectGenericComponent<string>;

abrirModal() {
  this.modal.open();
  
  // Customizar narração após abrir
  setTimeout(() => {
    this.modal.announceCustomMessage('Escolha uma opção da lista');
  }, 300);
}
```

### 2. `setCustomOpeningMessage(customMessage: (titulo: string) => string)`

Customiza a mensagem narrada quando o modal é aberto.

**Exemplo:**
```typescript
ngAfterViewInit() {
  // Customizar narração de abertura
  this.modal.setCustomOpeningMessage((titulo) => {
    return `${titulo}, lista com ${this.opcoes.length} opções`;
  });
}
```

### 3. `setSelectionMessageFormatter(formatter: (option, position, total) => string)`

Customiza o formato da narração quando um item é selecionado.

**Parâmetros:**
- `formatter`: Função que recebe:
  - `option`: A opção selecionada
  - `position`: Posição do item (1-based)
  - `total`: Total de itens

**Exemplo:**
```typescript
ngAfterViewInit() {
  // Narração simples ao selecionar
  this.modal.setSelectionMessageFormatter((option, position, total) => {
    return `${option.label} selecionado`;
  });
  
  // Ou com mais informações
  this.modal.setSelectionMessageFormatter((option, position, total) => {
    return `Opção ${position}: ${option.label} selecionada`;
  });
}
```

## Exemplos de Uso Completo

### Exemplo 1: Narração Minimalista

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ModalSelectGenericComponent } from './modal-select-generic.component';

@Component({
  selector: 'app-meu-componente',
  template: `
    <app-modal-select-generic
      [titulo]="'Selecione o mês'"
      [options]="meses"
      [(ngModel)]="mesSelecionado">
    </app-modal-select-generic>
  `
})
export class MeuComponente implements AfterViewInit {
  @ViewChild(ModalSelectGenericComponent) modal!: ModalSelectGenericComponent<string>;
  
  meses = [
    { label: 'Janeiro', value: '01' },
    { label: 'Fevereiro', value: '02' },
    // ...
  ];
  
  mesSelecionado = '';
  
  ngAfterViewInit() {
    // Narração apenas do título ao abrir
    this.modal.setCustomOpeningMessage((titulo) => titulo);
    
    // Narração apenas do label ao selecionar
    this.modal.setSelectionMessageFormatter((option) => option.label);
  }
}
```

### Exemplo 2: Narração Detalhada

```typescript
ngAfterViewInit() {
  // Narração completa ao abrir
  this.modal.setCustomOpeningMessage((titulo) => {
    return `${titulo}, caixa de diálogo com ${this.meses.length} opções disponíveis`;
  });
  
  // Narração completa ao selecionar
  this.modal.setSelectionMessageFormatter((option, position, total) => {
    return `${option.label} selecionado, item ${position} de ${total}`;
  });
}
```

### Exemplo 3: Narração Contextual

```typescript
ngAfterViewInit() {
  // Narração com contexto
  this.modal.setCustomOpeningMessage((titulo) => {
    const opcoesFiltradas = this.meses.filter(m => m.disponivel);
    return `${titulo}, ${opcoesFiltradas.length} meses disponíveis`;
  });
  
  // Narração com informações adicionais
  this.modal.setSelectionMessageFormatter((option, position, total) => {
    const info = this.getInfoAdicional(option.value);
    return `${option.label}, ${info}, selecionado`;
  });
}

private getInfoAdicional(value: string): string {
  // Lógica para obter informação adicional
  return 'disponível para consulta';
}
```

### Exemplo 4: Anúncios Dinâmicos

```typescript
onFiltrar() {
  const resultados = this.filtrarOpcoes();
  
  // Anunciar resultado do filtro
  this.modal.announceCustomMessage(
    `${resultados.length} opções encontradas`,
    'polite'
  );
}

onErro() {
  // Anunciar erro de forma assertiva
  this.modal.announceCustomMessage(
    'Erro ao carregar opções',
    'assertive'
  );
}
```

## Comportamento Padrão

Se nenhuma customização for aplicada, o modal usa narrações padrão:

**Abertura:**
- Formato: `[Título]`
- Exemplo: `"Selecione o mês"`

**Seleção:**
- Formato: `[Posição] de [Total], [Status], [Label]`
- Exemplo: `"3 de 12, selecionado, Março"`

## Prioridade de Narrações

O componente segue esta ordem de prioridade:

1. **`customSelectionFormatter`** (via `setSelectionMessageFormatter`)
2. **`ariaLabelFn`** (input do componente)
3. **Formato padrão**

## Boas Práticas

1. **Seja conciso**: Narrações longas prejudicam a experiência
   - ✅ Bom: `"Janeiro"`
   - ❌ Ruim: `"Janeiro, mês número 1, clique para selecionar o primeiro mês do ano"`

2. **Evite redundância**: Não repita informações que o leitor de tela já fornece
   - ✅ Bom: `"Janeiro selecionado"`
   - ❌ Ruim: `"Botão Janeiro selecionado, botão"`

3. **Use prioridade correta**:
   - `'assertive'`: Erros, avisos urgentes, mudanças críticas
   - `'polite'`: Informações, confirmações, atualizações

4. **Teste com leitores de tela**: Sempre teste com VoiceOver, NVDA ou JAWS

## Compatibilidade

- ✅ VoiceOver (macOS/iOS)
- ✅ NVDA (Windows)
- ✅ JAWS (Windows)
- ✅ TalkBack (Android)

## Notas Técnicas

- Usa `LiveAnnouncer` do Angular CDK para narrações programáticas
- Implementa `aria-live` regions para compatibilidade máxima
- Gerencia timing automaticamente para evitar conflitos
- Limpa narrações anteriores antes de anunciar novas

