import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FocusTargetDirective } from './focus-target.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <!-- Teste com ID (string) -->
    <button id="btn-string" appFocusTarget="#target-string">Focar String</button>
    <div id="target-string">Target String</div>

    <!-- Teste com ElementRef (HTMLElement) -->
    <button id="btn-ref" [appFocusTarget]="targetRef">Focar Ref</button>
    <div #targetRef id="target-ref">Target Ref</div>

    <!-- Teste com Delay -->
    <button id="btn-delay" appFocusTarget="#target-delay" [focusDelay]="100">Focar Delay</button>
    <div id="target-delay">Target Delay</div>
  `,
  standalone: true,
  imports: [FocusTargetDirective]
})
class TestComponent {}

describe('FocusTargetDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, FocusTargetDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar a diretiva', () => {
    const directive = fixture.debugElement.query(By.directive(FocusTargetDirective));
    expect(directive).toBeTruthy();
  });

  it('deve focar elemento alvo via ID (string)', () => {
    const button = fixture.debugElement.query(By.css('#btn-string'));
    const target = fixture.debugElement.query(By.css('#target-string')).nativeElement;

    // Mock do focus para verificar chamada
    const focusSpy = jest.spyOn(target, 'focus');

    button.triggerEventHandler('click', new MouseEvent('click'));

    // Deve adicionar tabindex="-1" para elementos não interativos
    expect(target.getAttribute('tabindex')).toBe('-1');
    expect(focusSpy).toHaveBeenCalled();
  });

  it('deve focar elemento alvo via referência direta', () => {
    const button = fixture.debugElement.query(By.css('#btn-ref'));
    const target = fixture.debugElement.query(By.css('#target-ref')).nativeElement;

    const focusSpy = jest.spyOn(target, 'focus');

    button.triggerEventHandler('click', new MouseEvent('click'));

    expect(focusSpy).toHaveBeenCalled();
  });

  it('deve respeitar o delay configurado', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('#btn-delay'));
    const target = fixture.debugElement.query(By.css('#target-delay')).nativeElement;

    const focusSpy = jest.spyOn(target, 'focus');

    button.triggerEventHandler('click', new MouseEvent('click'));

    // Não deve ter chamado ainda
    expect(focusSpy).not.toHaveBeenCalled();

    // Avança o tempo
    tick(100);

    expect(focusSpy).toHaveBeenCalled();
  }));

  it('não deve lançar erro se alvo não existe', () => {
    // Cria um botão com alvo inválido dinamicamente ou usa um teste isolado
    // Aqui vamos apenas verificar que clicar em algo sem target válido não quebra
    const button = fixture.debugElement.query(By.css('#btn-string'));
    
    // Força target inválido na diretiva
    const directiveInstance = button.injector.get(FocusTargetDirective);
    directiveInstance.target = '#nao-existe';

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => {
      button.triggerEventHandler('click', new MouseEvent('click'));
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Elemento alvo não encontrado'), '#nao-existe');
  });
});

