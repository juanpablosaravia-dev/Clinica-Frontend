import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import { provideRouter } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptores/token.interceptor';
import { PaginadorEs } from './utilidades/paginador-es';

// Datos de idioma de Argentina: hacen que el pipe "date" escriba los nombres de
// días y meses en español (por ejemplo "miércoles, 28 de octubre de 2026").
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Todas las peticiones HTTP pasan por el interceptor que agrega el token.
    provideHttpClient(withInterceptors([tokenInterceptor])),
    // Idioma por defecto de los pipes (date, number, etc.).
    { provide: LOCALE_ID, useValue: 'es-AR' },
    // "Cuando alguien pida MatPaginatorIntl, entregale PaginadorEs": así el paginador sale en español.
    { provide: MatPaginatorIntl, useClass: PaginadorEs },
  ],
};
