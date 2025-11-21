/**
 * ============================================================================
 * CONFIGURAÇÃO GLOBAL DE ACESSIBILIDADE
 * ============================================================================
 * 
 * Configurações centralizadas para controlar comportamento de acessibilidade
 * em toda a aplicação.
 * 
 * @author Sistema
 * @version 1.0.0
 */

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Configuração de foco
 */
export interface FocusConfig {
  /**
   * Cor do outline de foco
   * @default '#0046c0'
   */
  readonly color: string;

  /**
   * Largura do outline em pixels
   * @default 2
   */
  readonly width: number;

  /**
   * Offset do outline em pixels
   * @default 2
   */
  readonly offset: number;

  /**
   * Estilo do outline
   * @default 'solid'
   */
  readonly style: 'solid' | 'dashed' | 'dotted';
}

/**
 * Configuração de anúncios (live regions)
 */
export interface AnnouncementConfig {
  /**
   * Delay padrão em ms antes de anunciar
   * @default 100
   */
  readonly defaultDelay: number;

  /**
   * Politeness padrão para anúncios
   * @default 'polite'
   */
  readonly defaultPoliteness: 'off' | 'polite' | 'assertive';

  /**
   * Duração em ms que a mensagem fica no DOM
   * @default 1000
   */
  readonly messageDuration: number;
}

/**
 * Configuração de navegação por teclado
 */
export interface KeyboardNavigationConfig {
  /**
   * Habilitar navegação por setas
   * @default true
   */
  readonly enableArrowKeys: boolean;

  /**
   * Habilitar navegação Home/End
   * @default true
   */
  readonly enableHomeEnd: boolean;

  /**
   * Habilitar busca por primeira letra (typeahead)
   * @default true
   */
  readonly enableTypeahead: boolean;

  /**
   * Timeout do typeahead em ms
   * @default 500
   */
  readonly typeaheadTimeout: number;

  /**
   * Habilitar navegação circular (wrap around)
   * @default true
   */
  readonly enableCircularNavigation: boolean;
}

/**
 * Configuração de elementos customizados
 */
export interface CustomElementsConfig {
  /**
   * Remover semântica nativa e usar ARIA customizada
   * @default true
   */
  readonly overrideNativeSemantics: boolean;

  /**
   * Adicionar tabindex automaticamente em elementos não focáveis
   * @default true
   */
  readonly autoTabindex: boolean;

  /**
   * Prefixo para IDs gerados automaticamente
   * @default 'a11y'
   */
  readonly idPrefix: string;
}

/**
 * Configuração de debug
 */
export interface DebugConfig {
  /**
   * Modo debug (mostra outlines em elementos)
   * @default false
   */
  readonly enabled: boolean;

  /**
   * Log de anúncios no console
   * @default false
   */
  readonly logAnnouncements: boolean;

  /**
   * Log de navegação por teclado
   * @default false
   */
  readonly logKeyboardNavigation: boolean;

  /**
   * Log de mudanças de foco
   * @default false
   */
  readonly logFocusChanges: boolean;
}

/**
 * Configuração completa de acessibilidade
 */
export interface AccessibilityConfig {
  readonly focus: FocusConfig;
  readonly announcements: AnnouncementConfig;
  readonly keyboardNavigation: KeyboardNavigationConfig;
  readonly customElements: CustomElementsConfig;
  readonly debug: DebugConfig;
}

// ============================================================================
// CONFIGURAÇÃO PADRÃO
// ============================================================================

/**
 * Configuração padrão de acessibilidade
 * Seguindo WCAG 2.1 Level AA
 */
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  focus: {
    color: '#0046c0',
    width: 2,
    offset: 2,
    style: 'solid'
  },
  announcements: {
    defaultDelay: 100,
    defaultPoliteness: 'polite',
    messageDuration: 1000
  },
  keyboardNavigation: {
    enableArrowKeys: true,
    enableHomeEnd: true,
    enableTypeahead: true,
    typeaheadTimeout: 500,
    enableCircularNavigation: true
  },
  customElements: {
    overrideNativeSemantics: true,
    autoTabindex: true,
    idPrefix: 'a11y'
  },
  debug: {
    enabled: false,
    logAnnouncements: false,
    logKeyboardNavigation: false,
    logFocusChanges: false
  }
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gera ID único para elementos de acessibilidade
 */
let idCounter = 0;
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Verifica se elemento é focável nativamente
 */
export function isNativelyFocusable(element: HTMLElement): boolean {
  const focusableTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
  return (
    focusableTags.includes(element.tagName) &&
    !element.hasAttribute('disabled') &&
    element.getAttribute('tabindex') !== '-1'
  );
}

/**
 * Aplica role="none" ou "presentation" para remover semântica
 */
export function removeNativeSemantics(element: HTMLElement): void {
  element.setAttribute('role', 'presentation');
  element.setAttribute('aria-hidden', 'true');
}

/**
 * Cria região live para anúncios
 */
export function createLiveRegion(
  politeness: 'polite' | 'assertive' = 'polite'
): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', politeness);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  return liveRegion;
}

/**
 * Anuncia mensagem para leitores de tela
 */
export function announce(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite',
  delay: number = DEFAULT_ACCESSIBILITY_CONFIG.announcements.defaultDelay
): void {
  setTimeout(() => {
    const liveRegion = createLiveRegion(politeness);
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);

    // Remover após duração
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, DEFAULT_ACCESSIBILITY_CONFIG.announcements.messageDuration);

    // Log se debug habilitado
    if (DEFAULT_ACCESSIBILITY_CONFIG.debug.logAnnouncements) {
      console.log(`[A11Y] Announcement (${politeness}): ${message}`);
    }
  }, delay);
}

/**
 * Verifica se usuário prefere movimento reduzido
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Verifica se usuário prefere alto contraste
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Verifica se usuário prefere modo escuro
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Aplica configurações de foco customizadas
 */
export function applyFocusStyles(
  element: HTMLElement,
  config: Partial<FocusConfig> = {}
): void {
  const focusConfig = { ...DEFAULT_ACCESSIBILITY_CONFIG.focus, ...config };
  
  element.style.outline = `${focusConfig.width}px ${focusConfig.style} ${focusConfig.color}`;
  element.style.outlineOffset = `${focusConfig.offset}px`;
}

/**
 * Remove configurações de foco
 */
export function removeFocusStyles(element: HTMLElement): void {
  element.style.outline = '';
  element.style.outlineOffset = '';
}

/**
 * Habilita modo debug de acessibilidade
 */
export function enableDebugMode(): void {
  document.body.classList.add('debug-a11y');
  
  // Atualizar config
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).enabled = true;
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).logAnnouncements = true;
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).logKeyboardNavigation = true;
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).logFocusChanges = true;
  
  console.log('[A11Y] Debug mode enabled');
}

/**
 * Desabilita modo debug de acessibilidade
 */
export function disableDebugMode(): void {
  document.body.classList.remove('debug-a11y');
  
  // Atualizar config
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).enabled = false;
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).logAnnouncements = false;
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).logKeyboardNavigation = false;
  (DEFAULT_ACCESSIBILITY_CONFIG.debug as any).logFocusChanges = false;
  
  console.log('[A11Y] Debug mode disabled');
}

/**
 * Verifica se elemento está visível no viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scrolla elemento para a view de forma acessível
 */
export function scrollToElement(
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (prefersReducedMotion()) {
    behavior = 'auto';
  }

  element.scrollIntoView({
    behavior,
    block: 'nearest',
    inline: 'nearest'
  });
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Teclas de navegação
 */
export const NAVIGATION_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const;

/**
 * Roles ARIA comuns
 */
export const ARIA_ROLES = {
  NONE: 'none',
  PRESENTATION: 'presentation',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  LOG: 'log',
  MARQUEE: 'marquee',
  TIMER: 'timer',
  BUTTON: 'button',
  LINK: 'link',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  LISTBOX: 'listbox',
  OPTION: 'option',
  COMBOBOX: 'combobox',
  GRID: 'grid',
  GRIDCELL: 'gridcell'
} as const;

/**
 * Politeness levels para live regions
 */
export const ARIA_LIVE = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive'
} as const;

// ============================================================================
// EXPORTAR TUDO
// ============================================================================

export * from './accessibility.config';

