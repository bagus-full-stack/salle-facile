import {ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {authInterceptor} from './core/auth/auth.interceptor';
import {provideHttpClient, withInterceptors} from '@angular/common/http';


registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr-FR' }, // On définit le LOCALE_ID pour que les pipes (date, currency)
  ]
};
