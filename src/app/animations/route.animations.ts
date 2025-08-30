import { trigger, transition, style, animate, query, stagger, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(100%)' })
    ], { optional: true }),
    query(':leave', [
      style({ opacity: 1, transform: 'translateX(0%)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0%)' }))
      ], { optional: true })
    ])
  ])
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
  ])
]);

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
]);

export const scaleInOut = trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
  ])
]);

export const staggerAnimation = trigger('staggerAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(100, [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    style({ transform: 'scale(0.3)', opacity: 0 }),
    animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
      style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

export const flipIn = trigger('flipIn', [
  transition(':enter', [
    style({ transform: 'perspective(400px) rotateY(90deg)', opacity: 0 }),
    animate('400ms ease-out', 
      style({ transform: 'perspective(400px) rotateY(0deg)', opacity: 1 }))
  ])
]);
