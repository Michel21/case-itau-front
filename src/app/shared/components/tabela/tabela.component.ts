import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    input,
    output,
    signal,
    computed,
    effect,
    viewChild,
    contentChildren,
    contentChild,
    TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { PaginacaoComponent } from './paginacao/paginacao.component';
import { FiltrarDadosPipe } from './filtrar-dados.pipe';
import { SliceDadosPipe } from './slice-dados.pipe';
import { TabelaHeaderDirective } from './tabela-header.directive';

/**
 * Componente de Tabela - Standalone
 * Angular 19.2
 * 
 * Tabela completa com ordenação, paginação, busca, seleção e linhas expansíveis.
 * Utiliza Signals API para melhor performance e reatividade.
 * 
 * @example
 * ```html
 * <app-tabela [itens]="dados()" [temPaginacao]="true">
 *   <ng-template sortBy="nome">Nome</ng-template>
 *   <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>
 * </app-tabela>
 * ```
 */
@Component({
    selector: 'app-tabela',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PaginacaoComponent,
        FiltrarDadosPipe,
        SliceDadosPipe,
    ],
    templateUrl: './tabela.component.html',
    styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // Subscription para cleanup
    private searchSubscription?: Subscription;
    // ============================================================================
    // INPUT SIGNALS (Angular 17+)
    // ============================================================================
    
    /** Mostra ou oculta o cabeçalho da tabela */
    readonly mostrarHeader = input<boolean>(true);
    
    /** Título da tabela exibido no caption */
    readonly caption = input<string>();
    
    /** Array de dados da tabela */
    readonly itens = input<Array<any>>([]);
    
    /** Exibe campo de busca */
    readonly buscaMostrarCampo = input<boolean>(false);
    
    /** Ativa busca estática (filtra localmente) */
    readonly buscaAtivarBuscaEstatica = input<boolean>(true);
    
    /** Propriedades a serem consideradas na busca */
    readonly buscarNasPropriedades = input<Array<string>>();
    
    /** Índices das colunas sem ordenação */
    readonly desabilitarOrdenadacao = input<Array<number>>([]);
    
    /** Ativa paginação */
    readonly temPaginacao = input<boolean>(false);
    
    /** Ativa linhas expansíveis */
    readonly temExpansivel = input<boolean>(false);
    
    /** Exibe checkboxes para seleção múltipla */
    readonly temCheckbox = input<boolean>(false);
    
    /** Exibe radio buttons para seleção única */
    readonly temRadioButton = input<boolean>(false);
    
    /** Label do seletor de itens por página */
    readonly labelResultadosPorPagina = input<string>('Resultados por página');
    
    /** Label do botão anterior */
    readonly labelAnterior = input<string>('Anterior');
    
    /** Label do botão próximo */
    readonly labelProximo = input<string>('Próximo');

    // ============================================================================
    // OUTPUT SIGNALS (Angular 17+)
    // ============================================================================
    
    /** Emite o valor da busca (debounce 200ms) */
    readonly buscaOnChange = output<string>();
    
    /** Emite quando uma linha é selecionada via checkbox */
    readonly checkboxRowClick = output<any>();
    
    /** Emite quando o checkbox "selecionar todos" é clicado */
    readonly checkboxHeaderClick = output<boolean>();
    
    /** Emite quando uma linha é selecionada via radio button */
    readonly radioButtonRowClick = output<any>();
    
    /** Emite quando uma linha é expandida */
    readonly expandeRowClick = output<any>();
    
    /** Emite quando o tamanho da página muda */
    readonly onSetPageSize = output<number>();
    
    /** Emite quando uma coluna é ordenada */
    readonly onSort = output<string>();

    // ============================================================================
    // STATE SIGNALS
    // ============================================================================
    
    /** Palavra-chave da busca */
    readonly buscaKeyword = signal('');
    
    /** Itens da página atual */
    readonly pageOfItens = signal<Array<any>>([]);
    
    /** Página atual */
    readonly currentPage = signal(1);
    
    /** Quantidade de itens por página */
    readonly pageSize = signal(50);
    
    /** Índice inicial da paginação */
    readonly paginacaoStartIndex = signal(0);
    
    /** Índice final da paginação */
    readonly paginacaoEndIndex = signal(50);
    
    /** Classes CSS das colunas para ordenação */
    readonly sortClassColumn = signal<Array<string>>([]);
    
    /** Estado do checkbox do header */
    readonly checkHeader = signal<boolean | undefined>(false);
    
    /** Colspan para linhas expansíveis */
    readonly colspanExpansivel = signal(0);
    
    /** Opções de tamanho de página */
    readonly recordsPageSize = signal([
        { numero: 50 },
        { numero: 100 },
        { numero: 150 },
        { numero: 200 },
    ]);

    // ============================================================================
    // COMPUTED SIGNALS
    // ============================================================================
    
    /**
     * Itens processados com propriedades adicionais para expansão e seleção
     */
    readonly itensProcessados = computed(() => {
        let items = [...this.itens()];
        
        // Adicionar propriedades para expansão
        if (this.temExpansivel()) {
            items = items.map((a, i) => ({
                ...a,
                _internalID: a._internalID ?? i,
                expande: a.expande ?? false,
                iconeExpansivel: (a.expande ?? false) ? 'icon seta-cima' : 'icon seta-baixo',
                borderLeftAzul: (a.expande ?? false) ? 'borderLeftAzul' : '',
            }));
        }

        // Adicionar propriedades para seleção
        if (this.temCheckbox() || this.temRadioButton()) {
            items = items.map((a) => ({
                ...a,
                check: a.check ?? false,
                linhaAzul: (a.check ?? false) ? 'linhaAzul' : '',
            }));
        }

        return items;
    });

    // ============================================================================
    // VIEWCHILD & CONTENTCHILD SIGNALS (Angular 17.3+)
    // ============================================================================
    
    /** Referência ao input de busca */
    readonly inputBusca = viewChild<ElementRef>('inputBusca');
    
    /** Template de botões do caption */
    readonly botoesCaption = contentChild<TemplateRef<any>>('botoesCaption');
    
    /** Templates dos headers (deprecated) */
    readonly headers = contentChildren<TemplateRef<any>>('header', { descendants: false });
    
    /** Diretivas dos headers com sortBy */
    readonly headersDirective = contentChildren(TabelaHeaderDirective, { descendants: false });
    
    /** Templates das colunas de dados */
    readonly colunas = contentChildren<TemplateRef<any>>('dados', { descendants: false });
    
    /** Templates de conteúdo expansível */
    readonly expansiveis = contentChildren<TemplateRef<any>>('expansivel', { descendants: false });

    // ============================================================================
    // CONSTRUCTOR & EFFECTS
    // ============================================================================

    constructor() {
        // Effect para reagir a mudanças nos itens
        // Note: Effects são automaticamente limpos quando o componente é destruído
        effect(() => {
            const items = this.itens();
            
            if (items && items.length > 0) {
                // Atualizar sort columns
                this.sortClassColumn.set(
                    Array(Object.keys(items[0]).length).fill('tabela-sort-headerUnSorted')
                );
                
                // Atualizar paginação
                if (!this.temPaginacao()) {
                    this.paginacaoEndIndex.set(items.length);
                }
                
                // Atualizar colspan
                let colspan = Object.keys(items[0]).length;
                if (this.temExpansivel() || this.temCheckbox() || this.temRadioButton()) {
                    colspan++;
                }
                this.colspanExpansivel.set(colspan);
            }
        });
    }

    ngOnDestroy(): void {
        // Limpar subscription da busca
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    // ============================================================================
    // LIFECYCLE HOOKS
    // ============================================================================

    ngOnInit(): void {
        const items = this.itens();
        
        if (!items || items.length === 0) {
            return;
        }

        if (this.temPaginacao()) {
            this.pageOfItens.set(items.slice(0, this.pageSize() - 1));
            this.currentPage.set(1);
        }
    }

    ngAfterViewInit(): void {
        const inputElement = this.inputBusca();
        
        if (this.buscaMostrarCampo() && inputElement) {
            // Armazenar subscription para cleanup
            this.searchSubscription = fromEvent(inputElement.nativeElement, 'keyup')
                .pipe(
                    map((event: any) => event.target.value),
                    debounceTime(200)
                )
                .subscribe((palavra) => {
                    this.buscaKeyword.set(palavra);
                    this.buscaOnChange.emit(palavra);

                    // Reset para página 1
                    this.paginacaoStartIndex.set(0);
                    this.paginacaoEndIndex.set(this.pageSize());
                    this.currentPage.set(1);
                });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['itens']) {
            this.paginacaoStartIndex.set(0);
            this.paginacaoEndIndex.set(
                this.temPaginacao() ? this.pageSize() : this.itens().length
            );
            this.currentPage.set(1);
        }
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Callback quando a página muda
     */
    onChangePage(paginacao: { startIndex: number; endIndex: number; currentPage: number }): void {
        const items = this.itensProcessados();
        this.pageOfItens.set(items.slice(paginacao.startIndex, paginacao.endIndex));
        this.paginacaoStartIndex.set(paginacao.startIndex);
        this.paginacaoEndIndex.set(paginacao.endIndex);
        this.currentPage.set(paginacao.currentPage);
    }

    /**
     * Altera o tamanho da página
     */
    setPageSize(event: { numero: number }): void {
        this.pageSize.set(event.numero);
        this.currentPage.set(1);
        this.onSetPageSize.emit(this.pageSize());
    }

    /**
     * Expande ou colapsa uma linha
     */
    expande(internalID: number): void {
        if (!this.temExpansivel()) return;

        const items = this.temPaginacao() 
            ? this.pageOfItens() 
            : this.itensProcessados();
            
        const item = items.find((item) => item._internalID === internalID);
        
        if (item) {
            item.expande = !item.expande;
            item.iconeExpansivel = item.expande ? 'icon seta-cima' : 'icon seta-baixo';
            item.borderLeftAzul = item.expande ? 'borderLeftAzul' : '';

            this.expandeRowClick.emit({
                index: internalID,
                expande: item.expande,
            });
        }
    }

    /**
     * Ordena uma coluna
     */
    ordena(index: number, column?: string): void {
        const items = this.itensProcessados();
        
        if (!items || items.length === 0) return;

        // Resetar outras colunas
        this.sortClassColumn.update(columns => 
            columns.map((col, i) => i !== index ? 'tabela-sort-headerUnSorted' : col)
        );

        // Determinar direção da ordenação
        let order: number;
        const currentSort = this.sortClassColumn()[index];

        if (currentSort === 'tabela-sort-headerAsc') {
            this.sortClassColumn.update(cols => {
                const newCols = [...cols];
                newCols[index] = 'tabela-ordenacao-headerDesc';
                return newCols;
            });
            order = -1;
        } else {
            this.sortClassColumn.update(cols => {
                const newCols = [...cols];
                newCols[index] = 'tabela-sort-headerAsc';
                return newCols;
            });
            order = 1;
        }

        // Buscar nome da coluna
        const columnName = column || Object.keys(items[0])[index];
        this.onSort.emit(columnName);

        // Buscar tipo da coluna
        const valorColuna = items[0][columnName] || items.find((a) => a[columnName])?.[columnName] || '';
        const typeColumn = typeof valorColuna;

        // Clonar array para ordenação
        const sortedItems = [...items];

        // Ordenar baseado no tipo
        switch (typeColumn) {
            case 'string':
                sortedItems.sort((a, b) => {
                    const nameA = a[columnName] ? String(a[columnName]).toLowerCase() : '';
                    const nameB = b[columnName] ? String(b[columnName]).toLowerCase() : '';
                    
                    if (nameA > nameB) return order;
                    if (nameA < nameB) return order * -1;
                    return 0;
                });
                break;

            case 'number':
                sortedItems.sort((a, b) => {
                    const numberA = a[columnName] || 0;
                    const numberB = b[columnName] || 0;
                    return order === 1 ? numberA - numberB : numberB - numberA;
                });
                break;

            case 'object':
                if (items[0][columnName] instanceof Date) {
                    sortedItems.sort((a, b) => {
                        const dateA = a[columnName];
                        const dateB = b[columnName];
                        return order === 1 ? dateA - dateB : dateB - dateA;
                    });
                }
                break;
        }

        this.pageOfItens.set(
            sortedItems.slice(this.paginacaoStartIndex(), this.paginacaoEndIndex())
        );
    }

    /**
     * Altera o estado do checkbox do header
     */
    valueChangeHeader(event: boolean | undefined): void {
        const checkedValue: boolean = event === undefined ? true : event;
        this.checkHeader.set(event);

        const items = this.itensProcessados();
        items.forEach((item) => {
            item.check = checkedValue;
            item.linhaAzul = checkedValue ? 'linhaAzul' : '';
        });

        this.checkboxHeaderClick.emit(checkedValue);
    }

    /**
     * Altera o estado do checkbox de uma linha
     */
    valueChangeItem(event: boolean, index: number): void {
        const items = this.itensProcessados();
        
        // Ajustar índice se houver paginação
        if (this.temPaginacao()) {
            index = (this.currentPage() - 1) * this.pageSize() + index;
        }

        // Alternar checkbox
        items[index].check = !items[index].check;
        items[index].linhaAzul = items[index].check ? 'linhaAzul' : '';

        // Atualizar checkbox do header
        const qtdChecked = items.filter((a) => a.check).length;
        
        this.checkHeader.set(
            qtdChecked > 0
                ? qtdChecked === items.length
                    ? true
                    : undefined
                : false
        );

        // Emitir evento com item limpo
        const cloneItens = { ...items[index] };
        delete cloneItens._internalID;
        delete cloneItens.expande;
        delete cloneItens.iconeExpansivel;
        delete cloneItens.borderLeftAzul;
        delete cloneItens.linhaAzul;
        
        this.checkboxRowClick.emit(cloneItens);
    }

    /**
     * Altera o estado do radio button de uma linha
     */
    valueChangeItemRadio(event: boolean, index: number): void {
        const items = this.itensProcessados();
        
        // Ajustar índice se houver paginação
        index = (this.currentPage() - 1) * this.pageSize() + index;

        // Limpar todas as linhas e selecionar apenas a clicada
        items.forEach((a) => (a.linhaAzul = ''));
        items[index].linhaAzul = 'linhaAzul';

        // Emitir evento com item limpo
        const cloneItens = { ...items[index] };
        delete cloneItens.expande;
        delete cloneItens.iconeExpansivel;
        delete cloneItens.borderLeftAzul;
        delete cloneItens.linhaAzul;
        delete cloneItens.check;
        delete cloneItens._internalID;
        
        this.radioButtonRowClick.emit(cloneItens);
    }
}
