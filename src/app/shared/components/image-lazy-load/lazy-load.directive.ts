import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { _PATH } from '../../constants/constants';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements AfterViewInit, OnDestroy {
  @HostBinding('attr.src') srcAttr = `${_PATH}/circle-loading-animation.gif`;
  @Input() src!: string;
  
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    if (this.canLazyLoad()) {
      this.lazyLoadImage();
    } else {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private canLazyLoad(): boolean {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  }

  private lazyLoadImage(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting }) => {
          if (isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );
    
    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    if (this.src) {
      const img = new Image();
      img.onload = () => {
        this.srcAttr = this.src;
      };
      img.onerror = () => {
        this.srcAttr = `${_PATH}/circle-loading-animation.gif`;
      };
      img.src = this.src;
    }
  }
}
