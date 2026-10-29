import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Punto de entrada de la aplicación: arranca el componente raíz (App) con la
// configuración global de app.config.ts (rutas, HttpClient con el interceptor, idioma).
// App es el que se dibuja dentro de <app-root> en index.html.
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
