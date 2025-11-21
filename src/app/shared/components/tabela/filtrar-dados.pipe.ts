import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe standalone para filtrar arrays de objetos
 * Angular 19.2 - Standalone API
 */
@Pipe({ 
    name: 'filtrarArray',
    standalone: true,
    pure: true
})
export class FiltrarDadosPipe implements PipeTransform {
    /**
     * Filtra um array de objeto analisando as propriedades do tipo string de cada
     * elemento do array.
     *
     * @param itens Array de objetos que será filtrado
     * @param keyword Palavra que está sendo procurada dentro de cada propriedade do tipo "string"
     * de cada linha
     * @param buscarNasPropriedades Array com o nome das propriedades que serão consideradas
     * na busca
     */
    transform(
        itens: Array<any>,
        keyword: string,
        buscarNasPropriedades?: Array<string>
    ): Array<any> {
        if (!keyword || keyword.trim() === '') {
            return itens;
        }

        const keywordLower = keyword.toLowerCase();

        return itens.filter((item) => {
            // Pega as propriedades do tipo string
            let stringProps = Object.keys(item).filter(
                (prop) => typeof item[prop] === 'string'
            );

            // Se fornecido, considera a busca apenas em cima das propriedades que constam
            // em buscarNasPropriedades
            if (buscarNasPropriedades && buscarNasPropriedades.length > 0) {
                stringProps = stringProps.filter(
                    (prop) => buscarNasPropriedades.includes(prop)
                );
            }

            return stringProps.some((prop) =>
                item[prop].toLowerCase().includes(keywordLower)
            );
        });
    }
}
