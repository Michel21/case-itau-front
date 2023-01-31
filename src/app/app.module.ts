import { BrowserModule } from '@angular/platform-browser';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './features/home/home.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './security/api.interceptor';
import { ListDetailComponent } from './features/list-detail/list-detail.component';
import { SharedModule } from './shared/shared.module';
import localePt from "@angular/common/locales/pt";
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt, "pt-br"); // currency: 'BRL':true 

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ListDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: "pt-BR" },
    { provide: DEFAULT_CURRENCY_CODE, useValue: "BRL" },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
