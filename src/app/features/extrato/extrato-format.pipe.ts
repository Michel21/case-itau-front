import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'extratoFormat'
})
export class ExtratoFormatPipe implements PipeTransform {
  transform(value: any, type: 'moeda' | 'data' | 'percentual'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    switch (type) {
      case 'moeda':
        return this.formatarMoeda(value);
      case 'data':
        return this.formatarData(value);
      case 'percentual':
        return this.formatarPercentual(value);
      default:
        return String(value);
    }
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  private formatarData(data: string): string {
    return data;
  }

  private formatarPercentual(valor: number): string {
    if (valor === null || valor === undefined) return '-';
    return valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + '%';
  }
}
