import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  valor: string;
  nome: string;
}

@Component({
  selector: 'app-modal-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-select-container">
      <label [for]="id" class="modal-select-label">{{ label }}</label>
      <div class="modal-select-wrapper">
        <select
          [id]="id"
          [value]="value"
          (change)="onSelectChange($event)"
          (blur)="onTouched()"
          class="modal-select"
          [class.modal-select-invalid]="invalid"
          [disabled]="disabled">
          <option value="">{{ placeholder }}</option>
          @for (option of optionsSelect; track option.valor) {
            <option [value]="option.valor">
              {{ option.nome }}
            </option>
          }
        </select>
        <span class="modal-select-arrow">▼</span>
      </div>
      @if (helperText) {
        <span class="modal-select-helper">{{ helperText }}</span>
      }
    </div>
  `,
  styleUrls: ['./modal-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModalSelectComponent),
      multi: true
    }
  ]
})
export class ModalSelectComponent implements ControlValueAccessor, OnInit {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() type: string = '';
  @Input() placeholder: string = '';
  @Input() prefix: string = '';
  @Input() optionsSelect: SelectOption[] = [];
  @Input() helperText: string = '';
  @Input() invalid: boolean = false;

  value: string = '';
  disabled: boolean = false;

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  public onTouched = () => {};

  ngOnInit(): void {
    // Inicialização se necessário
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}
