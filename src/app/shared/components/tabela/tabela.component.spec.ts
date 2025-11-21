import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { TabelaComponent } from './tabela.component';

describe('TabelaComponent - Standalone', () => {
    let component: TabelaComponent;
    let fixture: ComponentFixture<TabelaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TabelaComponent] // Import standalone component
        }).compileComponents();

        fixture = TestBed.createComponent(TabelaComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default signal values', () => {
        expect(component.currentPage()).toBe(1);
        expect(component.pageSize()).toBe(50);
        expect(component.mostrarHeader()).toBe(true);
        expect(component.temPaginacao()).toBe(false);
    });

    it('should handle empty items array', () => {
        fixture.componentRef.setInput('itens', []);
        component.ngOnInit();
        expect(component.itens()).toEqual([]);
    });

    it('should process items with expansivel', () => {
        const mockItems = [
            { nome: 'Test 1', codigo: '123' },
            { nome: 'Test 2', codigo: '456' }
        ];
        
        fixture.componentRef.setInput('itens', mockItems);
        fixture.componentRef.setInput('temExpansivel', true);
        fixture.detectChanges();
        
        const processed = component.itensProcessados();
        expect(processed[0]._internalID).toBeDefined();
        expect(processed[0].expande).toBeDefined();
    });

    it('should emit search event', (done) => {
        component.buscaOnChange.subscribe((value: string) => {
            expect(value).toBe('test');
            done();
        });
        
        component.buscaOnChange.emit('test');
    });

    it('should toggle checkbox correctly', () => {
        const mockItems = [
            { nome: 'Item 1', check: false },
            { nome: 'Item 2', check: false }
        ];
        
        fixture.componentRef.setInput('itens', mockItems);
        fixture.detectChanges();
        
        component.valueChangeHeader(true);
        expect(component.checkHeader()).toBe(true);
    });

    it('should handle page size change', () => {
        const newSize = { numero: 100 };
        component.setPageSize(newSize);
        expect(component.pageSize()).toBe(100);
        expect(component.currentPage()).toBe(1);
    });

    it('should compute processed items correctly', () => {
        const mockItems = [{ nome: 'Test' }];
        fixture.componentRef.setInput('itens', mockItems);
        
        const processed = component.itensProcessados();
        expect(processed).toBeDefined();
        expect(Array.isArray(processed)).toBe(true);
    });

    it('should handle sorting', () => {
        const mockItems = [
            { nome: 'Charlie', valor: 3 },
            { nome: 'Alice', valor: 1 },
            { nome: 'Bob', valor: 2 }
        ];
        
        fixture.componentRef.setInput('itens', mockItems);
        component.ngOnInit();
        
        component.ordena(0, 'nome');
        
        // Verificar que o sort foi chamado
        expect(component.sortClassColumn().length).toBeGreaterThan(0);
    });

    it('should work with signals in component', () => {
        const dadosSignal = signal([
            { id: 1, nome: 'Teste' }
        ]);
        
        fixture.componentRef.setInput('itens', dadosSignal());
        fixture.detectChanges();
        
        expect(component.itens().length).toBe(1);
    });
});
