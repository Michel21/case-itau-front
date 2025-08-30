import { trigger, transition, style, animate, query, stagger, state } from '@angular/animations';

// Animação para cards de gatos
export const catCardAnimation = trigger('catCardAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(30px) scale(0.9)' }),
    animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
      style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', 
      style({ opacity: 0, transform: 'translateY(-30px) scale(0.9)' }))
  ])
]);

// Animação para lista de gatos com stagger
export const catListAnimation = trigger('catListAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(150, [
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

// Animação para botões
export const buttonAnimation = trigger('buttonAnimation', [
  state('normal', style({ transform: 'scale(1)' })),
  state('hover', style({ transform: 'scale(1.05)' })),
  transition('normal => hover', animate('200ms ease-in')),
  transition('hover => normal', animate('200ms ease-out'))
]);

// Animação para loading
export const loadingAnimation = trigger('loadingAnimation', [
  state('loading', style({ opacity: 0.7 })),
  state('loaded', style({ opacity: 1 })),
  transition('loading => loaded', animate('300ms ease-in')),
  transition('loaded => loading', animate('300ms ease-out'))
]);

// Animação para modal/dialog
export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.8) translateY(-50px)' }),
    animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
      style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', 
      style({ opacity: 0, transform: 'scale(0.8) translateY(-50px)' }))
  ])
]);

// Animação para overlay
export const overlayAnimation = trigger('overlayAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0 }))
  ])
]);

// Animação para notificações
export const notificationAnimation = trigger('notificationAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%)' }),
    animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
      style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', 
      style({ opacity: 0, transform: 'translateX(100%)' }))
  ])
]);

// Animação para skeleton loading
export const skeletonAnimation = trigger('skeletonAnimation', [
  state('loading', style({
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%'
  })),
  state('loaded', style({
    background: 'transparent'
  })),
  transition('loading => loaded', animate('500ms ease-in'))
]);
