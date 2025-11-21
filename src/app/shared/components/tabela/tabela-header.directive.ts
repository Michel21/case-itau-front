import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Diretiva standalone para definir colunas ordenáveis
 * Angular 19.2 - Standalone API
 */
@Directive({
    selector: '[sortBy]',
    standalone: true
})
export class TabelaHeaderDirective {
    @Input('sortBy') campoOrdenacao!: string;

    constructor(public template: TemplateRef<any>) {}
}
