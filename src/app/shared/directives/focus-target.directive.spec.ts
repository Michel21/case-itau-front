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

  it('deve focar elemento alvo via ID (string) ao clicar', () => {
    const button = fixture.debugElement.query(By.css('#btn-string'));
    const target = fixture.debugElement.query(By.css('#target-string')).nativeElement;

    const focusSpy = jest.spyOn(target, 'focus');

    button.triggerEventHandler('click', new MouseEvent('click'));

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

    expect(focusSpy).not.toHaveBeenCalled();

    tick(100);

    expect(focusSpy).toHaveBeenCalled();
  }));

  it('deve focar ao pressionar PageDown', () => {
    const button = fixture.debugElement.query(By.css('#btn-string'));
    const target = fixture.debugElement.query(By.css('#target-string')).nativeElement;
    const focusSpy = jest.spyOn(target, 'focus');

    const event = new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    button.triggerEventHandler('keydown', event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('deve focar ao pressionar Tab', () => {
    const button = fixture.debugElement.query(By.css('#btn-string'));
    const target = fixture.debugElement.query(By.css('#target-string')).nativeElement;
    const focusSpy = jest.spyOn(target, 'focus');

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    button.triggerEventHandler('keydown', event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('NÃO deve focar ao pressionar Shift+Tab', () => {
    const button = fixture.debugElement.query(By.css('#btn-string'));
    const target = fixture.debugElement.query(By.css('#target-string')).nativeElement;
    const focusSpy = jest.spyOn(target, 'focus');

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });
    
    button.triggerEventHandler('keydown', event);

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('não deve lançar erro se alvo não existe', () => {
    const button = fixture.debugElement.query(By.css('#btn-string'));
    const directiveInstance = button.injector.get(FocusTargetDirective);
    directiveInstance.target = '#nao-existe';

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => {
      button.triggerEventHandler('click', new MouseEvent('click'));
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Elemento alvo não encontrado'), '#nao-existe');
  });
});
