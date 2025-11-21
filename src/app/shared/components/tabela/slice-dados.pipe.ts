import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe standalone para paginar arrays
 * Angular 19.2 - Standalone API
 */
@Pipe({ 
    name: 'sliceArray',
    standalone: true,
    pure: true
})
export class SliceDadosPipe implements PipeTransform {
    /**
     * Pagina um array de objeto
     *
     * @param itens Array de objetos que será efetuado o slice
     * @param startIndex Índice inicial
     * @param endIndex Índice final
     */
    transform(itens: Array<any>, startIndex: number, endIndex: number): Array<any> {
        if (!itens || !Array.isArray(itens)) {
            return [];
        }

        return itens.slice(startIndex, endIndex);
    }
}
