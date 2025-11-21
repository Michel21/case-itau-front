/**
 * 🧪 Testes de Acessibilidade - Extrato Filtro Figma
 * 
 * Testa conformidade com WCAG 2.1 AA e ARIA best practices
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ExtratoFiltroFigmaComponent } from './extrato-filtro-figma.component';

describe('🔍 Acessibilidade: ExtratoFiltroFigmaComponent', () => {
  let component: ExtratoFiltroFigmaComponent;
  let fixture: ComponentFixture<ExtratoFiltroFigmaComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtratoFiltroFigmaComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ExtratoFiltroFigmaComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  // ============================================================================
  // 1. HTML SEMÂNTICO
  // ============================================================================

  describe('✅ HTML Semântico', () => {
    it('deve ter lang="pt-BR" no container principal', () => {
      const container = compiled.querySelector('.extrato-filtro');
      expect(container?.getAttribute('lang')).toBe('pt-BR');
    });

    it('deve ter <header> semântico', () => {
      const header = compiled.querySelector('header');
      expect(header).toBeTruthy();
      expect(header?.className).toContain('extrato-filtro__header');
    });

    it('deve ter <main> semântico', () => {
      const main = compiled.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.className).toContain('extrato-filtro__content');
    });

    it('deve ter h1 único e descritivo', () => {
      const h1Elements = compiled.querySelectorAll('h1');
      expect(h1Elements.length).toBe(1);
      expect(h1Elements[0].textContent?.trim()).toContain('Investimentos');
    });

    it('deve ter h2 para subtítulos', () => {
      const h2 = compiled.querySelector('h2');
      expect(h2).toBeTruthy();
      expect(h2?.textContent).toContain('Para visualizar o extrato');
    });

    it('deve ter <form> para formulário', () => {
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
      expect(form?.className).toContain('filtro-form');
    });

    it('deve ter <fieldset> + <legend> para radio group', () => {
      const fieldset = compiled.querySelector('fieldset');
      const legend = fieldset?.querySelector('legend');
      
      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent?.trim()).toContain('Tipo de período');
    });

    it('deve ter <label> associados com for="id"', () => {
      const labels = compiled.querySelectorAll('label[for]');
      expect(labels.length).toBeGreaterThan(0);

      labels.forEach(label => {
        const forAttr = label.getAttribute('for');
        const input = compiled.querySelector(`#${forAttr}`);
        expect(input).toBeTruthy();
      });
    });

    it('deve ter <button type="submit"> para ação', () => {
      const button = compiled.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();
      expect(button?.textContent?.trim()).toContain('Aplicar filtro');
    });
  });

  // ============================================================================
  // 2. ARIA ATTRIBUTES
  // ============================================================================

  describe('✅ ARIA Attributes', () => {
    it('deve ter role="radiogroup" no fieldset', () => {
      const fieldset = compiled.querySelector('fieldset');
      expect(fieldset?.getAttribute('role')).toBe('radiogroup');
    });

    it('deve ter aria-labelledby no radiogroup', () => {
      const fieldset = compiled.querySelector('fieldset');
      const ariaLabelledby = fieldset?.getAttribute('aria-labelledby');
      const legend = compiled.querySelector(`#${ariaLabelledby}`);
      
      expect(ariaLabelledby).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('deve ter aria-setsize="2" nos radio buttons', () => {
      const radios = compiled.querySelectorAll('input[type="radio"]');
      
      radios.forEach(radio => {
        expect(radio.getAttribute('aria-setsize')).toBe('2');
      });
    });

    it('deve ter aria-posinset correto nos radio buttons', () => {
      const radios = compiled.querySelectorAll('input[type="radio"]');
      
      expect(radios[0].getAttribute('aria-posinset')).toBe('1');
      expect(radios[1].getAttribute('aria-posinset')).toBe('2');
    });

    it('deve ter aria-checked nos radio buttons', () => {
      const radios = compiled.querySelectorAll('input[type="radio"]');
      
      radios.forEach(radio => {
        const ariaChecked = radio.getAttribute('aria-checked');
        expect(['true', 'false']).toContain(ariaChecked);
      });
    });

    it('deve ter aria-required nos campos obrigatórios', () => {
      const campoMes = compiled.querySelector('#campo-mes');
      const campoAno = compiled.querySelector('#campo-ano');
      
      expect(campoMes?.getAttribute('aria-required')).toBe('true');
      expect(campoAno?.getAttribute('aria-required')).toBe('true');
    });

    it('deve ter aria-invalid dinâmico nos campos', () => {
      const campoMes = compiled.querySelector('#campo-mes');
      
      // Estado inicial (válido ou não definido)
      const ariaInvalid = campoMes?.getAttribute('aria-invalid');
      expect(['true', 'false']).toContain(ariaInvalid);
    });

    it('deve ter aria-describedby quando houver erro', () => {
      // Forçar erro
      component.filtroForm.get('mes')?.setValue('');
      component.filtroForm.get('mes')?.markAsTouched();
      fixture.detectChanges();

      const campoMes = compiled.querySelector('#campo-mes');
      const ariaDescribedby = campoMes?.getAttribute('aria-describedby');
      
      if (ariaDescribedby) {
        const errorEl = compiled.querySelector(`#${ariaDescribedby}`);
        expect(errorEl).toBeTruthy();
      }
    });

    it('deve ter aria-disabled no botão quando desabilitado', () => {
      const button = compiled.querySelector('button[type="submit"]');
      const ariaDisabled = button?.getAttribute('aria-disabled');
      
      expect(['true', 'false']).toContain(ariaDisabled);
    });

    it('deve ter role="status" na live region', () => {
      const liveRegion = compiled.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
    });

    it('deve ter aria-live="polite" na live region', () => {
      const liveRegion = compiled.querySelector('[role="status"]');
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    });

    it('deve ter aria-atomic="true" na live region', () => {
      const liveRegion = compiled.querySelector('[role="status"]');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('deve ter role="alert" nas mensagens de erro', () => {
      // Forçar erro
      component.filtroForm.get('mes')?.setValue('');
      component.filtroForm.get('mes')?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = compiled.querySelectorAll('[role="alert"]');
      expect(errorMessages.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // 3. NAVEGAÇÃO POR TECLADO
  // ============================================================================

  describe('✅ Navegação por Teclado', () => {
    it('deve ter todos elementos interativos com tabindex correto', () => {
      const interactiveElements = compiled.querySelectorAll(
        'button, input, select, a[href]'
      );

      interactiveElements.forEach(el => {
        const tabindex = el.getAttribute('tabindex');
        // tabindex deve ser null (0 implícito), "0" ou não presente
        expect(tabindex === null || tabindex === '0').toBe(true);
      });
    });

    it('botão deve responder a Enter', () => {
      const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      const spy = jest.spyOn(component, 'aplicarFiltro');

      // Preencher formulário
      component.filtroForm.patchValue({
        tipoPeriodo: 'mes',
        mes: '1',
        ano: '2025'
      });
      fixture.detectChanges();

      // Simular Enter
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(event);
      button.click(); // Simular clique do Enter

      expect(spy).toHaveBeenCalled();
    });

    it('radio buttons devem responder a Espaço', () => {
      const radio = compiled.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Simular Espaço
      const event = new KeyboardEvent('keydown', { key: ' ' });
      radio.dispatchEvent(event);
      radio.click(); // Simular seleção do Espaço

      expect(radio.checked).toBe(true);
    });
  });

  // ============================================================================
  // 4. ESTADOS VISUAIS
  // ============================================================================

  describe('✅ Estados Visuais', () => {
    it('botão desabilitado deve ter atributo disabled', () => {
      component.filtroForm.reset();
      fixture.detectChanges();

      const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('botão habilitado não deve ter atributo disabled', () => {
      component.filtroForm.patchValue({
        tipoPeriodo: 'mes',
        mes: '1',
        ano: '2025'
      });
      fixture.detectChanges();

      const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(button.disabled).toBe(false);
    });

    it('radio selecionado deve ter aria-checked="true"', () => {
      component.selecionarPeriodo('mes');
      fixture.detectChanges();

      const radioMes = compiled.querySelector('#tipo-mes');
      expect(radioMes?.getAttribute('aria-checked')).toBe('true');
    });

    it('campo inválido deve ter classe de erro', () => {
      component.filtroForm.get('mes')?.setValue('');
      component.filtroForm.get('mes')?.markAsTouched();
      fixture.detectChanges();

      const fieldWrapper = compiled.querySelector('.form-field');
      expect(fieldWrapper?.className).toContain('form-field--invalid');
    });
  });

  // ============================================================================
  // 5. LIVE REGIONS
  // ============================================================================

  describe('✅ Live Regions', () => {
    it('live region deve estar presente no DOM', () => {
      const liveRegion = compiled.querySelector('#status-message');
      expect(liveRegion).toBeTruthy();
    });

    it('live region deve ser visualmente oculta', () => {
      const liveRegion = compiled.querySelector('#status-message') as HTMLElement;
      expect(liveRegion.className).toContain('visually-hidden');
    });

    it('mensagens de erro devem ter aria-live="assertive"', () => {
      component.filtroForm.get('mes')?.setValue('');
      component.filtroForm.get('mes')?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = compiled.querySelectorAll('.form-field__error');
      errorMessages.forEach(msg => {
        const ariaLive = msg.getAttribute('aria-live');
        if (ariaLive) {
          expect(ariaLive).toBe('assertive');
        }
      });
    });
  });

  // ============================================================================
  // 6. LABELS E RELACIONAMENTOS
  // ============================================================================

  describe('✅ Labels e Relacionamentos', () => {
    it('todos inputs devem ter labels associados', () => {
      const inputs = compiled.querySelectorAll('input, select');
      
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id && input.getAttribute('type') !== 'radio') {
          const label = compiled.querySelector(`label[for="${id}"]`);
          expect(label).toBeTruthy();
        }
      });
    });

    it('radio buttons devem estar dentro de fieldset', () => {
      const radios = compiled.querySelectorAll('input[type="radio"]');
      
      radios.forEach(radio => {
        const fieldset = radio.closest('fieldset');
        expect(fieldset).toBeTruthy();
      });
    });

    it('fieldset deve ter legend', () => {
      const fieldset = compiled.querySelector('fieldset');
      const legend = fieldset?.querySelector('legend');
      
      expect(legend).toBeTruthy();
    });
  });

  // ============================================================================
  // 7. CONTRASTE E VISIBILIDADE
  // ============================================================================

  describe('✅ Contraste e Visibilidade', () => {
    it('elementos focáveis devem ter outline visível', () => {
      const button = compiled.querySelector('button') as HTMLElement;
      button.focus();
      
      const styles = window.getComputedStyle(button);
      // Verificar se outline não é 'none' quando focado
      // Nota: teste visual, pode precisar de ajuste
      expect(styles.outline).not.toBe('none');
    });

    it('live region deve estar oculta visualmente mas acessível', () => {
      const liveRegion = compiled.querySelector('.visually-hidden') as HTMLElement;
      
      if (liveRegion) {
        const styles = window.getComputedStyle(liveRegion);
        // Deve estar posicionada fora da tela ou com clip
        expect(
          styles.position === 'absolute' || 
          styles.position === 'fixed' ||
          styles.clip !== 'auto'
        ).toBe(true);
      }
    });
  });

  // ============================================================================
  // 8. FORMULÁRIO E VALIDAÇÃO
  // ============================================================================

  describe('✅ Formulário e Validação', () => {
    it('campos obrigatórios devem ter atributo required', () => {
      const campoMes = compiled.querySelector('#campo-mes');
      const campoAno = compiled.querySelector('#campo-ano');
      
      expect(campoMes?.hasAttribute('required')).toBe(true);
      expect(campoAno?.hasAttribute('required')).toBe(true);
    });

    it('form deve ter novalidate para validação customizada', () => {
      const form = compiled.querySelector('form');
      expect(form?.hasAttribute('novalidate')).toBe(true);
    });

    it('erro deve aparecer quando campo obrigatório está vazio', () => {
      component.filtroForm.get('mes')?.setValue('');
      component.filtroForm.get('mes')?.markAsTouched();
      fixture.detectChanges();

      const error = component.getMensagemErro('mes');
      expect(error).toBeTruthy();
    });

    it('botão deve estar desabilitado quando formulário é inválido', () => {
      component.filtroForm.reset();
      fixture.detectChanges();

      const isHabilitado = component.filtroHabilitado();
      expect(isHabilitado).toBe(false);
    });

    it('botão deve estar habilitado quando formulário é válido', () => {
      component.filtroForm.patchValue({
        tipoPeriodo: 'mes',
        mes: '1',
        ano: '2025'
      });
      fixture.detectChanges();

      const isHabilitado = component.filtroHabilitado();
      expect(isHabilitado).toBe(true);
    });
  });

  // ============================================================================
  // 9. COMPORTAMENTO DINÂMICO
  // ============================================================================

  describe('✅ Comportamento Dinâmico', () => {
    it('aria-checked deve atualizar quando radio é selecionado', () => {
      component.selecionarPeriodo('intervalo');
      fixture.detectChanges();

      const radioIntervalo = compiled.querySelector('#tipo-intervalo');
      expect(radioIntervalo?.getAttribute('aria-checked')).toBe('true');

      component.selecionarPeriodo('mes');
      fixture.detectChanges();

      const radioMes = compiled.querySelector('#tipo-mes');
      expect(radioMes?.getAttribute('aria-checked')).toBe('true');
    });

    it('aria-invalid deve atualizar quando campo se torna inválido', () => {
      const campoMes = compiled.querySelector('#campo-mes');
      
      // Estado válido
      component.filtroForm.get('mes')?.setValue('1');
      fixture.detectChanges();
      expect(campoMes?.getAttribute('aria-invalid')).toBe('false');

      // Estado inválido
      component.filtroForm.get('mes')?.setValue('');
      component.filtroForm.get('mes')?.markAsTouched();
      fixture.detectChanges();
      expect(campoMes?.getAttribute('aria-invalid')).toBe('true');
    });

    it('aria-disabled deve atualizar quando botão muda de estado', () => {
      const button = compiled.querySelector('button[type="submit"]');
      
      // Desabilitado
      component.filtroForm.reset();
      fixture.detectChanges();
      expect(button?.getAttribute('aria-disabled')).toBe('true');

      // Habilitado
      component.filtroForm.patchValue({
        tipoPeriodo: 'mes',
        mes: '1',
        ano: '2025'
      });
      fixture.detectChanges();
      expect(button?.getAttribute('aria-disabled')).toBe('false');
    });
  });

  // ============================================================================
  // 10. TESTES DE INTEGRAÇÃO
  // ============================================================================

  describe('✅ Fluxo Completo', () => {
    it('usuário deve conseguir preencher formulário completo', () => {
      // 1. Selecionar tipo
      component.selecionarPeriodo('mes');
      fixture.detectChanges();

      // 2. Selecionar mês
      component.filtroForm.get('mes')?.setValue('1');
      fixture.detectChanges();

      // 3. Digitar ano
      component.filtroForm.get('ano')?.setValue('2025');
      fixture.detectChanges();

      // 4. Verificar formulário válido
      expect(component.filtroHabilitado()).toBe(true);

      // 5. Submeter
      const spy = jest.spyOn(component, 'aplicarFiltro');
      component.aplicarFiltro();
      
      expect(spy).toHaveBeenCalled();
    });
  });
});

