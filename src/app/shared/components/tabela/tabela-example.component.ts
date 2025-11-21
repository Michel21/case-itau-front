import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabelaComponent } from './tabela.component';
import { TabelaHeaderDirective } from './tabela-header.directive';

/**
 * Componente de Exemplo - Tabela Component
 * Angular 19.2 - Standalone + Signals API
 */
@Component({
    selector: 'app-tabela-example',
    standalone: true,
    imports: [CommonModule, FormsModule, TabelaComponent, TabelaHeaderDirective],
    template: `
        <div class="container" style="padding: 2rem; max-width: 1400px; margin: 0 auto;">
            <h1 style="margin-bottom: 2rem;">📊 Exemplos do Componente Tabela</h1>
            <p style="margin-bottom: 2rem; color: #666;">
                Componente refatorado com Angular 19.2 - Signals API + Standalone
            </p>

            <section style="margin-bottom: 3rem;">
                <h2>1. Tabela Básica</h2>
                <app-tabela [itens]="itensBasicos()">
                    <ng-template sortBy="nome">Nome</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

                    <ng-template sortBy="codigo">Código</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.codigo }}</ng-template>

                    <ng-template sortBy="valor">Valor</ng-template>
                    <ng-template #dados let-elemento="elemento">R$ {{ elemento.valor | number:'1.2-2' }}</ng-template>
                </app-tabela>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>2. Tabela com Paginação</h2>
                <app-tabela [itens]="itensPaginacao()" [temPaginacao]="true">
                    <ng-template sortBy="nome">Nome</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

                    <ng-template sortBy="codigo">Código</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.codigo }}</ng-template>
                </app-tabela>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>3. Tabela com Busca Estática</h2>
                <app-tabela 
                    [itens]="itensBusca()"
                    [buscaMostrarCampo]="true"
                    [buscaAtivarBuscaEstatica]="true"
                    [buscarNasPropriedades]="['nome', 'codigo']">
                    <ng-template sortBy="nome">Nome</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

                    <ng-template sortBy="codigo">Código</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.codigo }}</ng-template>
                </app-tabela>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>4. Tabela com Checkbox</h2>
                <app-tabela 
                    [itens]="itensCheckbox()"
                    [temCheckbox]="true"
                    (checkboxRowClick)="onCheckboxRowClick($event)"
                    (checkboxHeaderClick)="onCheckboxHeaderClick($event)">
                    <ng-template sortBy="nome">Nome</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

                    <ng-template sortBy="status">Status</ng-template>
                    <ng-template #dados let-elemento="elemento">
                        @switch (elemento.status) {
                            @case ('Ativo') {
                                <span style="color: green; font-weight: 600;">✓ {{ elemento.status }}</span>
                            }
                            @case ('Inativo') {
                                <span style="color: red;">✗ {{ elemento.status }}</span>
                            }
                        }
                    </ng-template>
                </app-tabela>
                
                @if (totalSelecionados() > 0) {
                    <div style="margin-top: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 8px;">
                        <strong>📌 Itens selecionados:</strong> {{ totalSelecionados() }}
                        <button 
                            (click)="limparSelecao()"
                            style="margin-left: 1rem; padding: 0.5rem 1rem; background: #fff; border: 1px solid #3B69FF; color: #3B69FF; border-radius: 4px; cursor: pointer;">
                            Limpar Seleção
                        </button>
                    </div>
                }
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>5. Tabela com Linhas Expansíveis</h2>
                <app-tabela [itens]="itensExpansivel()" [temExpansivel]="true">
                    <ng-template sortBy="nome">Nome</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.nome }}</ng-template>

                    <ng-template sortBy="descricao">Descrição</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.descricao }}</ng-template>

                    <ng-template #expansivel let-elemento="elemento">
                        <div style="padding: 1.5rem; background: #f5f5f5; border-radius: 8px; margin: 0.5rem 0;">
                            <h4 style="margin: 0 0 1rem 0; color: #3B69FF;">🔍 Detalhes de {{ elemento.nome }}</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                                <div>
                                    <strong>Código:</strong> {{ elemento.codigo }}
                                </div>
                                <div>
                                    <strong>Categoria:</strong> {{ elemento.categoria }}
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <strong>Descrição completa:</strong><br>
                                    {{ elemento.detalhes }}
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </app-tabela>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>6. Tabela com Caption e Botões de Ação</h2>
                <app-tabela 
                    [itens]="itensCaption()"
                    [temCheckbox]="true"
                    caption="💼 Transações Financeiras">
                    
                    <ng-template #botoesCaption>
                        <button 
                            (click)="exportarTransacoes()"
                            style="padding: 0.5rem 1.5rem; background: white; border: 1px solid white; color: #3B69FF; border-radius: 20px; cursor: pointer; font-weight: 600;">
                            📥 Exportar
                        </button>
                        <button 
                            (click)="novaTransacao()"
                            style="margin-left: 0.5rem; padding: 0.5rem 1.5rem; background: white; border: 1px solid white; color: #3B69FF; border-radius: 20px; cursor: pointer; font-weight: 600;">
                            ➕ Nova
                        </button>
                    </ng-template>

                    <ng-template sortBy="data">Data</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.data }}</ng-template>

                    <ng-template sortBy="descricao">Descrição</ng-template>
                    <ng-template #dados let-elemento="elemento">{{ elemento.descricao }}</ng-template>

                    <ng-template sortBy="valor">Valor</ng-template>
                    <ng-template #dados let-elemento="elemento">
                        <span [style.color]="elemento.valor > 0 ? 'green' : 'red'" style="font-weight: 600;">
                            R$ {{ elemento.valor | number:'1.2-2' }}
                        </span>
                    </ng-template>
                </app-tabela>
            </section>
        </div>
    `,
})
export class TabelaExampleComponent {
    // ============================================================================
    // STATE SIGNALS
    // ============================================================================
    
    readonly itensBasicos = signal([
        { nome: 'Produto A', codigo: 'A001', valor: 150.50 },
        { nome: 'Produto B', codigo: 'B002', valor: 230.75 },
        { nome: 'Produto C', codigo: 'C003', valor: 89.90 },
        { nome: 'Produto D', codigo: 'D004', valor: 450.00 },
    ]);

    readonly itensPaginacao = signal(
        Array(150).fill(0).map((_, i) => ({
            nome: `Item ${i + 1}`,
            codigo: `COD${String(i + 1).padStart(4, '0')}`,
        }))
    );

    readonly itensBusca = signal([
        { nome: 'Certificado Digital', codigo: 'CD-001' },
        { nome: 'Usuário e Senha', codigo: 'US-002' },
        { nome: 'Token de Acesso', codigo: 'TA-003' },
        { nome: 'Biometria', codigo: 'BIO-004' },
        { nome: 'Autenticação Duplo Fator', codigo: '2FA-005' },
    ]);

    readonly itensCheckbox = signal([
        { id: 1, nome: 'Item Ativo 1', status: 'Ativo' },
        { id: 2, nome: 'Item Ativo 2', status: 'Ativo' },
        { id: 3, nome: 'Item Inativo 1', status: 'Inativo' },
        { id: 4, nome: 'Item Ativo 3', status: 'Ativo' },
    ]);

    readonly itensExpansivel = signal([
        { 
            nome: 'Notebook Dell', 
            descricao: 'Laptop profissional', 
            codigo: 'NB-001',
            categoria: 'Eletrônicos',
            detalhes: 'Notebook Dell Inspiron 15, 16GB RAM, 512GB SSD, Intel Core i7, tela 15.6" Full HD' 
        },
        { 
            nome: 'Mouse Logitech', 
            descricao: 'Mouse sem fio', 
            codigo: 'MS-002',
            categoria: 'Periféricos',
            detalhes: 'Mouse sem fio Logitech MX Master 3, sensor de alta precisão, bateria recarregável' 
        },
        { 
            nome: 'Teclado Mecânico', 
            descricao: 'Teclado gamer RGB', 
            codigo: 'KB-003',
            categoria: 'Periféricos',
            detalhes: 'Teclado mecânico switches Cherry MX Brown, iluminação RGB customizável, layout ABNT2' 
        },
    ]);

    readonly itensCaption = signal([
        { data: '10/01/2025', descricao: 'Pagamento fornecedor', valor: -1500.00 },
        { data: '11/01/2025', descricao: 'Recebimento cliente', valor: 2300.50 },
        { data: '12/01/2025', descricao: 'Compra equipamentos', valor: -899.99 },
    ]);

    readonly itensSelecionados = signal<any[]>([]);

    // ============================================================================
    // COMPUTED SIGNALS
    // ============================================================================
    
    readonly totalSelecionados = computed(() => 
        this.itensSelecionados().length
    );

    // ============================================================================
    // METHODS
    // ============================================================================

    onCheckboxRowClick(item: any): void {
        console.log('Item selecionado:', item);
        
        this.itensSelecionados.update(items => {
            if (item.check) {
                return [...items, item];
            } else {
                return items.filter(i => i.id !== item.id);
            }
        });
    }

    onCheckboxHeaderClick(selecionado: boolean): void {
        console.log('Todos selecionados:', selecionado);
        
        if (selecionado) {
            this.itensSelecionados.set([...this.itensCheckbox()]);
        } else {
            this.itensSelecionados.set([]);
        }
    }

    limparSelecao(): void {
        this.itensSelecionados.set([]);
        
        // Atualizar itens para desmarcar checkboxes
        this.itensCheckbox.update(items => 
            items.map(item => ({ ...item, check: false }))
        );
    }

    exportarTransacoes(): void {
        console.log('📥 Exportando transações:', this.itensCaption());
        alert('Transações exportadas com sucesso!');
    }

    novaTransacao(): void {
        const novaTransacao = {
            data: new Date().toLocaleDateString('pt-BR'),
            descricao: 'Nova transação',
            valor: 0
        };
        
        this.itensCaption.update(items => [...items, novaTransacao]);
        console.log('➕ Nova transação adicionada');
    }
}
