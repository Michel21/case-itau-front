import { 
  AfterViewInit, 
  Directive, 
  ElementRef, 
  HostBinding, 
  Input, 
  OnDestroy, 
  OnInit,
  NgZone,
  Renderer2,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { _PATH } from '../../constants/constants';

/**
 * Interface para configurações do lazy loading
 */
export interface LazyLoadConfig {
  /** Margem antes do elemento entrar na viewport (ex: '50px 0px') */
  rootMargin?: string;
  /** Threshold para disparar o carregamento (0-1) */
  threshold?: number;
  /** URL da imagem de fallback em caso de erro */
  fallbackUrl?: string;
  /** URL da imagem de loading */
  loadingUrl?: string;
  /** Tempo máximo de carregamento em ms */
  timeout?: number;
  /** Se deve usar blur effect durante carregamento */
  useBlur?: boolean;
  /** Classes CSS para aplicar durante carregamento */
  loadingClasses?: string[];
  /** Classes CSS para aplicar quando carregado */
  loadedClasses?: string[];
  /** Classes CSS para aplicar em caso de erro */
  errorClasses?: string[];
}

/**
 * Diretiva profissional para lazy loading de imagens
 * 
 * @example
 * ```html
 * <img appLazyLoad 
 *      [src]="imageUrl" 
 *      [config]="{ rootMargin: '100px', threshold: 0.1 }"
 *      alt="Descrição da imagem">
 * ```
 */
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
  host: {
    '[class.lazy-loading]': 'isLoading()',
    '[class.lazy-loaded]': 'isLoaded()',
    '[class.lazy-error]': 'hasError()'
  }
})
export class LazyLoadDirective implements OnInit, AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly ngZone = inject(NgZone);

  // Signals para estado reativo
  private readonly loadingSignal = signal<boolean>(true);
  private readonly loadedSignal = signal<boolean>(false);
  private readonly errorSignal = signal<boolean>(false);
  private readonly srcSignal = signal<string>('');

  // Computed signals
  public readonly isLoading = this.loadingSignal.asReadonly();
  public readonly isLoaded = this.loadedSignal.asReadonly();
  public readonly hasError = this.errorSignal.asReadonly();

  // Inputs
  @Input() src!: string;
  @Input() config: LazyLoadConfig = {};
  @Input() alt?: string;

  // Host bindings
  @HostBinding('attr.src') get srcAttr(): string {
    return this.srcSignal();
  }

  @HostBinding('attr.alt') get altAttr(): string {
    return this.alt || '';
  }

  // Private properties
  private observer?: IntersectionObserver;
  private timeoutId?: number;
  private imageElement?: HTMLImageElement;

  // Default configuration
  private readonly defaultConfig: Required<LazyLoadConfig> = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    fallbackUrl: `${_PATH}/circle-loading-animation.gif`,
    loadingUrl: `${_PATH}/circle-loading-animation.gif`,
    timeout: 10000, // 10 seconds
    useBlur: true,
    loadingClasses: ['lazy-loading'],
    loadedClasses: ['lazy-loaded'],
    errorClasses: ['lazy-error']
  };

  ngOnInit(): void {
    this.initializeImage();
  }

  ngAfterViewInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Inicializa a imagem com configurações padrão
   */
  private initializeImage(): void {
    const config = { ...this.defaultConfig, ...this.config };
    
    // Define imagem de loading inicial
    this.srcSignal.set(config.loadingUrl);
    
    // Aplica classes de loading
    this.applyClasses(config.loadingClasses);
    
    // Aplica blur effect se configurado
    if (config.useBlur) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'filter', 'blur(5px)');
      this.renderer.setStyle(this.elementRef.nativeElement, 'transition', 'filter 0.3s ease');
    }
  }

  /**
   * Configura o lazy loading
   */
  private setupLazyLoading(): void {
    if (this.canLazyLoad()) {
      this.setupIntersectionObserver();
    } else {
      // Fallback para navegadores sem suporte
      this.loadImage();
    }
  }

  /**
   * Verifica se o navegador suporta IntersectionObserver
   */
  private canLazyLoad(): boolean {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  }

  /**
   * Configura o IntersectionObserver
   */
  private setupIntersectionObserver(): void {
    const config = { ...this.defaultConfig, ...this.config };

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting }) => {
          if (isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(this.elementRef.nativeElement);
          }
        });
      },
      {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  /**
   * Carrega a imagem com tratamento de erros e timeout
   */
  private loadImage(): void {
    if (!this.src) {
      this.handleError('No source URL provided');
      return;
    }

    const config = { ...this.defaultConfig, ...this.config };
    
    // Cria elemento de imagem para pré-carregamento
    this.imageElement = new Image();
    
    // Configura timeout
    this.timeoutId = window.setTimeout(() => {
      this.handleError('Image loading timeout');
    }, config.timeout);

    // Event listeners
    this.imageElement.onload = () => {
      this.handleSuccess();
    };

    this.imageElement.onerror = () => {
      this.handleError('Image failed to load');
    };

    // Inicia carregamento
    this.imageElement.src = this.src;
  }

  /**
   * Trata sucesso no carregamento
   */
  private handleSuccess(): void {
    this.ngZone.run(() => {
      const config = { ...this.defaultConfig, ...this.config };
      
      // Limpa timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }

      // Atualiza signals
      this.loadingSignal.set(false);
      this.loadedSignal.set(true);
      this.errorSignal.set(false);

      // Atualiza src
      this.srcSignal.set(this.src);

      // Remove classes de loading e adiciona classes de sucesso
      this.removeClasses(config.loadingClasses);
      this.applyClasses(config.loadedClasses);

      // Remove blur effect
      if (config.useBlur) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'filter', 'none');
      }

      // Log de sucesso em desenvolvimento
      if (!this.isProduction()) {
        // console.log removido por questões de segurança
      }
    });
  }

  /**
   * Trata erro no carregamento
   */
  private handleError(message: string): void {
    this.ngZone.run(() => {
      const config = { ...this.defaultConfig, ...this.config };
      
      // Limpa timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }

      // Atualiza signals
      this.loadingSignal.set(false);
      this.loadedSignal.set(false);
      this.errorSignal.set(true);

      // Define imagem de fallback
      this.srcSignal.set(config.fallbackUrl);

      // Remove classes de loading e adiciona classes de erro
      this.removeClasses(config.loadingClasses);
      this.applyClasses(config.errorClasses);

      // Remove blur effect
      if (config.useBlur) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'filter', 'none');
      }

      // Log de erro
      console.error(`❌ Image loading failed: ${message}`, {
        src: this.src,
        element: this.elementRef.nativeElement
      });
    });
  }

  /**
   * Aplica classes CSS ao elemento
   */
  private applyClasses(classes: string[]): void {
    classes.forEach(className => {
      this.renderer.addClass(this.elementRef.nativeElement, className);
    });
  }

  /**
   * Remove classes CSS do elemento
   */
  private removeClasses(classes: string[]): void {
    classes.forEach(className => {
      this.renderer.removeClass(this.elementRef.nativeElement, className);
    });
  }

  /**
   * Verifica se está em produção
   */
  private isProduction(): boolean {
    return typeof window !== 'undefined' && 
           window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1';
  }

  /**
   * Limpa recursos
   */
  private cleanup(): void {
    // Limpa timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    // Desconecta observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    // Limpa referência da imagem
    if (this.imageElement) {
      this.imageElement.onload = null;
      this.imageElement.onerror = null;
      this.imageElement = undefined;
    }
  }
}
