import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PoHttpRequestModule, PoModule } from '@po-ui/ng-components';
import { registerLocaleData } from '@angular/common';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import localeIt from '@angular/common/locales/it';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideEnvironmentNgxMask(), 
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom([PoModule, BrowserModule, BrowserAnimationsModule, PoHttpRequestModule]),
    {provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  
};