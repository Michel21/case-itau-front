import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { LoadingPlaceholderComponent } from './components/loading-placeholder/loading-placeholder.component';
import { LazyLoadDirective } from './components/image-lazy-load/lazy-load.directive';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';

const components = [
  LoaderComponent, 
  LoadingPlaceholderComponent, 
  LazyLoadDirective,
  FooterComponent,
  HeaderComponent
]

@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
  ],
  exports: [...components],
})
export class SharedModule { }
