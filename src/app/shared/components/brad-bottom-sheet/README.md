# BradBottomSheetComponent

Componente Bottom Sheet com melhorias de acessibilidade para iOS VoiceOver e outros leitores de tela.

## 📋 Características

- ✅ Acessibilidade completa (ARIA, focus trap, live announcer)
- ✅ Otimizado para iOS VoiceOver (remove verbalização dupla do título)
- ✅ Radio buttons acessíveis (PDF e Excel)
- ✅ Botão de download com aria-label dinâmico
- ✅ Link acessível no final
- ✅ Focus trap automático
- ✅ Anúncios para leitores de tela
- ✅ Suporte a gestos touch (swipe para fechar)
- ✅ Testes unitários com 90%+ de cobertura

## 🚀 Como Usar

### Importar o Componente

```typescript
import { BradBottomSheetComponent } from '@shared/components/brad-bottom-sheet';

@Component({
  imports: [BradBottomSheetComponent],
  // ...
})
export class MeuComponente {
  // ...
}
```

### Template

```html
<app-brad-bottom-sheet
  #bottomSheet
  (onBaixarExtrato)="baixarExtrato()"
  (onRedirecionarParaVisualizarHtml)="visualizarExtrato()">
</app-brad-bottom-sheet>
```

### TypeScript

```typescript
@ViewChild(BradBottomSheetComponent) bottomSheet!: BradBottomSheetComponent;

abrirModal(): void {
  this.bottomSheet.title.set('Baixar Extrato');
  this.bottomSheet.subtitle.set('Escolha o formato desejado');
  this.bottomSheet.openBsModal();
}

baixarExtrato(): void {
  const formato = this.bottomSheet.formatoSelecionado();
  console.log('Baixando em formato:', formato);
  // Lógica de download
}
```

## 🎯 Signals Disponíveis

- `title`: Título do modal
- `subtitle`: Subtítulo do modal
- `isOpen`: Estado de abertura/fechamento
- `hasCloseIcon`: Exibir/ocultar botão de fechar
- `botaoBaixarDesabilitado`: Estado do botão de download
- `formatoSelecionado`: Formato selecionado ('pdf' | 'xls' | null)

## 📤 Eventos (Outputs)

- `onHabilitarBtBaixar`: Emitido quando botão deve ser habilitado
- `onBaixarExtrato`: Emitido ao clicar no botão "Baixar"
- `onRedirecionarParaVisualizarHtml`: Emitido ao clicar no link

## ♿ Acessibilidade

### Melhorias para iOS VoiceOver

1. **Foco otimizado**: No iOS, o foco vai direto para o primeiro elemento interativo (radio button), não para o título
2. **Título não focável**: O título tem `tabindex="-1"` para evitar verbalização dupla
3. **Anúncios contextuais**: Mensagens são anunciadas para orientar o usuário
4. **MutationObserver**: Monitora e corrige tentativas da biblioteca LiquidCorp de alterar o tabindex do título

### ARIA

- `role="dialog"` no container
- `aria-modal="true"`
- `aria-labelledby` apontando para o título
- `role="radiogroup"` na seção de formatos
- `aria-describedby` nos radio buttons selecionados
- `aria-label` dinâmico no botão de download

## 🧪 Testes

```bash
npm run test:jest -- brad-bottom-sheet.component.spec.ts --coverage
```

### Cobertura Atual

- **Statements**: 97.32% ✅
- **Branches**: 95% ✅
- **Functions**: 96.55% ✅
- **Lines**: 98.14% ✅

**Total de testes**: 63 testes passando

## 📝 Notas Técnicas

- Usa `FocusTrapDirective` para manter foco dentro do modal
- Integra com biblioteca LiquidCorp para animações
- Suporta detecção de dispositivos iOS
- Usa `MutationObserver` para garantir acessibilidade no iOS
- Anúncios são removidos automaticamente após timeout

## 🔧 Dependências

- `@angular/core`
- `@angular/common`
- `@angular/forms`
- `FocusTrapDirective` (do projeto)
- Biblioteca `LiquidCorp` (externa)
