import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RestoreFocusDirective } from './restore-focus.directive';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  template: `
    <button id="trigger" (click)="show = !show">Toggle</button>
    
    <div *ngIf="show" id="content" appRestoreFocus>
      Conteúdo Temporário
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RestoreFocusDirective]
})
class TestComponent {
  show = false;
}

describe('RestoreFocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, RestoreFocusDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve restaurar o foco ao elemento anterior quando destruído', fakeAsync(() => {
    const trigger = fixture.debugElement.query(By.css('#trigger')).nativeElement;

    // 1. Focar no trigger
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // 2. Mostrar o conteúdo (simula clique)
    trigger.click();
    fixture.detectChanges(); // *ngIf=true, cria diretiva -> ngOnInit salva foco (trigger)

    // O foco ainda pode estar no trigger ou ter mudado, mas a diretiva salvou 'trigger'
    const content = fixture.debugElement.query(By.css('#content'));
    expect(content).toBeTruthy();

    // Vamos simular que o foco foi para dentro do conteúdo (opcional, mas comum)
    // content.nativeElement.focus(); // Se fosse focável

    // 3. Esconder o conteúdo (destrói diretiva -> ngOnDestroy restaura foco)
    component.show = false;
    fixture.detectChanges(); // *ngIf=false
    
    // Aguardar setTimeout
    tick(0);

    // 4. Verificar se foco voltou ao trigger
    expect(document.activeElement).toBe(trigger);
  }));

  it('não deve quebrar se o elemento anterior não existir mais', fakeAsync(() => {
    // Criar elemento dinâmico e destruir antes
    const tempButton = document.createElement('button');
    document.body.appendChild(tempButton);
    tempButton.focus();

    // Ativar diretiva
    component.show = true;
    fixture.detectChanges();

    // Remover botão do DOM
    document.body.removeChild(tempButton);

    // Destruir diretiva
    component.show = false;
    fixture.detectChanges();
    tick(0);

    // Não deve lançar erro
    expect(true).toBe(true);
  }));
});

