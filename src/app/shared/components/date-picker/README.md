# Date Picker Component

Um componente profissional e dinâmico de seleção de data com modal de calendário, desenvolvido com Angular 19.2.

## Características

- ✅ **Angular 19.2** com Signals e Control Flow
- ✅ **Reactive Forms** integrado
- ✅ **Acessibilidade** completa (WCAG 2.1)
- ✅ **Responsivo** para mobile e desktop
- ✅ **Customizável** com configurações flexíveis
- ✅ **Modal de calendário** interativo
- ✅ **Navegação por teclado** completa
- ✅ **Validação** integrada
- ✅ **Múltiplos formatos** de data
- ✅ **Seleção de intervalo** de datas
- ✅ **IDs dinâmicos** para elementos
- ✅ **Controle de botões** habilitado/desabilitado
- ✅ **Compatibilidade** com JavaScript original

## Uso Básico

```typescript
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

@Component({
  template: `
    <app-date-picker
      [control]="dateControl"
      [config]="dateConfig"
      (dateChange)="onDateChange($event)"
      (modalOpen)="onModalOpen($event)">
    </app-date-picker>
  `
})
export class MyComponent {
  dateControl = new FormControl('');
  
  dateConfig: DatePickerConfig = {
    label: 'Data de Nascimento',
    placeholder: 'Selecione sua data',
    helperText: 'Campo obrigatório',
    required: true,
    format: 'dd/MM/yyyy'
  };
  
  onDateChange(date: string) {
    console.log('Data selecionada:', date);
  }
  
  onModalOpen(isOpen: boolean) {
    console.log('Modal aberto:', isOpen);
  }
}
```

## Configurações

### DatePickerConfig

```typescript
interface DatePickerConfig {
  placeholder?: string;        // Texto do placeholder
  maxLength?: number;         // Tamanho máximo do campo
  label?: string;             // Label do campo
  helperText?: string;        // Texto de ajuda
  required?: boolean;         // Campo obrigatório
  disabled?: boolean;         // Campo desabilitado
  minDate?: Date;            // Data mínima permitida
  maxDate?: Date;            // Data máxima permitida
  format?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd'; // Formato da data
  withInterval?: boolean;     // Permite seleção de intervalo de datas
  separatorInterval?: string; // Separador para intervalo (padrão: ' - ')
  listMode?: boolean;        // Modo de lista (padrão: true)
}
```

## Eventos

- `dateChange`: Emitido quando uma data é selecionada
- `modalOpen`: Emitido quando o modal é aberto/fechado

## Acessibilidade

- ✅ **ARIA labels** e roles apropriados
- ✅ **Navegação por teclado** completa
- ✅ **Screen reader** compatível
- ✅ **Focus management** no modal
- ✅ **Escape key** para fechar modal

## Estilos

O componente usa classes CSS seguindo o padrão Brad Design System:

- `.brad-text-field` - Container do campo
- `.brad-modal` - Modal do calendário
- `.brad-calendar` - Calendário
- `.brad-btn` - Botões

## Responsividade

- ✅ **Mobile-first** design
- ✅ **Touch-friendly** para dispositivos móveis
- ✅ **Modal adaptativo** para diferentes telas
- ✅ **Calendário otimizado** para mobile

## Exemplo com Intervalo de Datas

```typescript
// Configuração para seleção de intervalo
const configIntervalo: DatePickerConfig = {
  label: 'Período',
  placeholder: 'Selecione o período',
  helperText: 'Período com intervalo de datas',
  format: 'dd/MM/yyyy',
  withInterval: true,
  separatorInterval: ' - ',
  listMode: true
};

// No template
<app-date-picker
  [control]="periodoControl"
  [config]="configIntervalo"
  (dateChange)="onPeriodoChange($event)"
  (modalOpen)="onModalToggle($event)">
</app-date-picker>
```

## Exemplo Completo

Veja o arquivo `date-picker-example.component.ts` para um exemplo completo de uso com múltiplos campos e validações.

## Dependências

- Angular 19.2+
- Angular Reactive Forms
- Angular Common

## Instalação

1. Copie os arquivos do componente para seu projeto
2. Importe o `DatePickerComponent` onde necessário
3. Configure o `ReactiveFormsModule` no seu módulo
4. Use o componente conforme a documentação
