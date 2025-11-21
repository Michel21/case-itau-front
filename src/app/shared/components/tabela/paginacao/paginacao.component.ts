import {
    Component,
    input,
    output,
    signal,
    computed,
    effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de Paginação - Standalone
 * Angular 19.2
 */
@Component({
    selector: 'app-paginacao',
    standalone: true,
    imports: [CommonModule],
    templateUrl: 'paginacao.component.html',
    styleUrls: ['./paginacao.component.scss']
})
export class PaginacaoComponent {
    // Input signals (Angular 17+)
    readonly labelAnterior = input<string>('Anterior');
    readonly labelProximo = input<string>('Próximo');
    readonly totalItems = input<number>(0);
    readonly currentPage = input<number>(1);
    readonly pageSize = input<number>(50);
    readonly maxPages = input<number>(5);

    // Output signals (Angular 17+)
    readonly changePage = output<any>();

    // State signals
    readonly pages = signal<Array<{descricao: number | string, page: number}>>([]);
    readonly firstPage = signal<boolean>(true);
    readonly lastPage = signal<boolean>(true);

    // Computed signals
    readonly totalPages = computed(() => 
        Math.ceil(this.totalItems() / this.pageSize())
    );

    readonly paginationConfig = computed(() => {
        const totalPages = this.totalPages();
        const currentPage = this.currentPage();
        const maxPages = this.maxPages();

        let startPage: number;
        let endPage: number;

        if (totalPages <= maxPages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            const maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrentPage) {
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        return { startPage, endPage, totalPages };
    });

    constructor() {
        // Effect para recalcular paginação quando inputs mudarem
        effect(() => {
            this.refreshComponent(this.currentPage());
        });
    }

    setPage(pageClicked: number): void {
        this.refreshComponent(pageClicked);
    }

    private refreshComponent(currentPage: number): void {
        const { startPage, endPage, totalPages } = this.paginationConfig();
        const totalItems = this.totalItems();
        const pageSize = this.pageSize();

        // Calcular índices
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // Gerar páginas
        const pages: Array<{descricao: number | string, page: number}> = Array.from(Array(endPage + 1 - startPage).keys()).map(
            (i) => ({
                descricao: startPage + i,
                page: startPage + i,
            })
        );

        if (pages.length === 0) {
            this.pages.set([]);
            return;
        }

        // Validar primeira e última página
        if (pages[0].descricao !== 1) {
            pages[0].descricao = '...';
            this.firstPage.set(false);
        } else {
            this.firstPage.set(true);
        }

        if (pages[pages.length - 1].descricao !== totalPages) {
            pages[pages.length - 1].descricao = '...';
            this.lastPage.set(false);
        } else {
            this.lastPage.set(true);
        }

        this.pages.set(pages);

        // Emitir evento
        this.changePage.emit({
            startIndex,
            endIndex: endIndex + 1,
            currentPage,
        });
    }
}
