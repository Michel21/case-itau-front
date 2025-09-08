import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerComponent, DatePickerConfig } from './date-picker.component';

@Component({
  selector: 'app-date-picker-example',
  templateUrl: './date-picker-example.component.html',
  styleUrls: ['./date-picker-example.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent]
})
export class DatePickerExampleComponent {
  // Formulário de exemplo
  exampleForm = new FormGroup({
    dataNascimento: new FormControl('', [Validators.required]),
    dataInicio: new FormControl(''),
    dataFim: new FormControl(''),
    periodo: new FormControl('')
  });

  // Configurações para diferentes campos
  readonly configDataNascimento: DatePickerConfig = {
    label: 'Data de Nascimento',
    placeholder: 'Selecione sua data de nascimento',
    helperText: 'Campo obrigatório',
    required: true,
    maxLength: 10,
    format: 'dd/MM/yyyy'
  };

  readonly configDataInicio: DatePickerConfig = {
    label: 'Data de Início',
    placeholder: 'Selecione a data de início',
    helperText: 'Data de início do período',
    format: 'dd/MM/yyyy',
    withInterval: false,
    listMode: true
  };

  readonly configDataFim: DatePickerConfig = {
    label: 'Data de Fim',
    placeholder: 'Selecione a data de fim',
    helperText: 'Data de fim do período',
    format: 'dd/MM/yyyy',
    withInterval: false,
    listMode: true
  };

  readonly configIntervalo: DatePickerConfig = {
    label: 'Período',
    placeholder: 'Selecione o período',
    helperText: 'Período com intervalo de datas',
    format: 'dd/MM/yyyy',
    withInterval: true,
    separatorInterval: ' - ',
    listMode: true
  };

  // Signals para demonstrar funcionalidades
  readonly selectedDates = signal<{[key: string]: string}>({});

  onDateChange(fieldName: string, value: string): void {
    this.selectedDates.update(dates => ({
      ...dates,
      [fieldName]: value
    }));
    
    console.log(`Data selecionada para ${fieldName}:`, value);
  }

  onModalOpen(isOpen: boolean): void {
    console.log('Modal aberto:', isOpen);
  }

  onSubmit(): void {
    if (this.exampleForm.valid) {
      console.log('Formulário válido:', this.exampleForm.value);
      console.log('Datas selecionadas:', this.selectedDates());
    } else {
      console.log('Formulário inválido');
      this.exampleForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.exampleForm.reset();
    this.selectedDates.set({});
  }
}
