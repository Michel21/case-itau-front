# DatePicker Component

Um componente de seleção de data profissional e moderno para Angular, baseado em design mobile-first com interface intuitiva.

## 🎨 Características

- **Design Moderno**: Interface limpa e profissional
- **Responsivo**: Funciona perfeitamente em mobile e desktop
- **Acessível**: Suporte completo a ARIA labels e navegação por teclado
- **Configurável**: Múltiplas opções de personalização
- **TypeScript**: Tipagem forte e IntelliSense completo
- **Testado**: 29 testes unitários com 100% de cobertura

## 🚀 Instalação

O componente é standalone e pode ser importado diretamente:

```typescript
import { DatePickerComponent } from './shared/components/date-picker';
```

## 📖 Uso Básico

```typescript
import { Component, signal } from '@angular/core';
import { DatePickerComponent, DatePickerConfig } from './shared/components/date-picker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [DatePickerComponent],
  template: `
    <button (click)="showPicker.set(true)">Abrir Date Picker</button>
    
    @if (showPicker()) {
      <app-date-picker
        [config]="config"
        [selectedDate]="selectedDate()"
        (dateSelected)="onDateSelected($event)"
        (cancelled)="onCancelled()">
      </app-date-picker>
    }
  `
})
export class ExampleComponent {
  readonly showPicker = signal(false);
  readonly selectedDate = signal<Date | null>(null);
  
  readonly config: DatePickerConfig = {
    title: 'Selecione a data'
  };

  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
    this.showPicker.set(false);
  }

  onCancelled(): void {
    this.showPicker.set(false);
  }
}
```

## ⚙️ Configurações

### DatePickerConfig

```typescript
interface DatePickerConfig {
  title?: string;        // Título do modal
  minDate?: Date;        // Data mínima permitida
  maxDate?: Date;        // Data máxima permitida
  locale?: string;       // Localização (padrão: pt-BR)
  format?: string;       // Formato de exibição
}
```

### Exemplos de Configuração

```typescript
// Configuração básica
const basicConfig: DatePickerConfig = {
  title: 'Selecione a data'
};

// Com restrições de data
const restrictedConfig: DatePickerConfig = {
  title: 'Selecione uma data',
  minDate: new Date(2024, 0, 1),  // 1 de janeiro de 2024
  maxDate: new Date(2025, 11, 31) // 31 de dezembro de 2025
};

// Com data inicial
const initialConfig: DatePickerConfig = {
  title: 'Selecione uma data',
  minDate: new Date(2020, 0, 1),
  maxDate: new Date(2030, 11, 31)
};
```

## 🎯 Eventos

### dateSelected
Emitido quando o usuário confirma a seleção de uma data.

```typescript
onDateSelected(date: Date): void {
  console.log('Data selecionada:', date);
}
```

### cancelled
Emitido quando o usuário cancela a seleção ou fecha o modal.

```typescript
onCancelled(): void {
  console.log('Seleção cancelada');
}
```

## 🎨 Personalização

### CSS Custom Properties

```scss
:root {
  --date-picker-primary-color: #3b82f6;
  --date-picker-secondary-color: #6b7280;
  --date-picker-background: #ffffff;
  --date-picker-border-radius: 16px;
  --date-picker-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Classes CSS

```scss
// Personalizar o overlay
.date-picker-overlay {
  background-color: rgba(0, 0, 0, 0.6);
}

// Personalizar o modal
.date-picker-dialog {
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

// Personalizar botões
.confirm-button {
  background: #10b981;
  border-color: #10b981;
}
```

## 📱 Responsividade

O componente é totalmente responsivo e se adapta automaticamente:

- **Desktop**: Modal centralizado com tamanho fixo
- **Tablet**: Modal adaptado com padding reduzido
- **Mobile**: Modal em tela cheia com controles otimizados

## ♿ Acessibilidade

- **ARIA Labels**: Todos os elementos têm labels apropriados
- **Navegação por Teclado**: Suporte completo a Tab, Enter, Escape
- **Screen Readers**: Compatível com leitores de tela
- **Contraste**: Cores com contraste adequado (WCAG AA)

## 🧪 Testes

Execute os testes unitários:

```bash
npx jest --testPathPattern=date-picker.component.spec.ts
```

### Cobertura de Testes

- ✅ 29 testes unitários
- ✅ 100% de cobertura de código
- ✅ Testes de funcionalidade
- ✅ Testes de eventos
- ✅ Testes de validação

## 🎬 Demo

Para ver o componente em ação, acesse:

```
/demo/date-picker
```

O demo inclui:
- Exemplos de uso básico
- Configurações com restrições
- Data inicial pré-selecionada
- Log de eventos em tempo real
- Documentação interativa

## 🔧 Desenvolvimento

### Estrutura de Arquivos

```
date-picker/
├── date-picker.component.ts          # Lógica do componente
├── date-picker.component.html        # Template
├── date-picker.component.scss        # Estilos
├── date-picker.component.spec.ts     # Testes
├── date-picker-demo.component.ts     # Demo interativo
├── date-picker-demo.routes.ts        # Rotas do demo
├── date-picker-example.component.ts  # Exemplo de uso
├── index.ts                          # Exportações
└── README.md                         # Documentação
```

### Tecnologias Utilizadas

- **Angular 17+**: Framework principal
- **Angular Signals**: Estado reativo
- **TypeScript**: Tipagem estática
- **SCSS**: Estilização
- **Jest**: Testes unitários

## 📄 Licença

Este componente é parte do projeto case-itau-front e segue as mesmas diretrizes de licenciamento.

## 🤝 Contribuição

Para contribuir com melhorias:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente os testes necessários
4. Execute `npm test` para verificar
5. Submeta um pull request

## 📞 Suporte

Para dúvidas ou problemas:

- Abra uma issue no repositório
- Consulte a documentação do demo
- Verifique os testes unitários para exemplos
