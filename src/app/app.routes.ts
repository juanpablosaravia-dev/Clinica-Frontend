import { Routes } from '@angular/router';
import { sesionGuard } from './guards/sesion.guard';
import { rolGuard } from './guards/rol.guard';
import { Inicio } from './paginas/inicio/inicio';
import { Login } from './paginas/login/login';
import { Registro } from './paginas/registro/registro';
import { Perfil } from './paginas/perfil/perfil';
import { EnConstruccion } from './paginas/en-construccion/en-construccion';
import { AccesoDenegado } from './paginas/acceso-denegado/acceso-denegado';
import { NoEncontrada } from './paginas/no-encontrada/no-encontrada';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'acceso-denegado', component: AccesoDenegado },

  // Cualquier usuario logueado
  { path: 'perfil', component: Perfil, canActivate: [sesionGuard] },

  // Una sección por rol: primero se pide sesión y después el rol indicado en "data".
  // Por ahora todas sus pantallas muestran "En construcción" (se completan en semanas futuras).
  {
    path: 'paciente',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'paciente' },
    children: [{ path: '**', component: EnConstruccion }],
  },
  {
    path: 'medico',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'medico' },
    children: [{ path: '**', component: EnConstruccion }],
  },
  {
    path: 'operador',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'operador' },
    children: [{ path: '**', component: EnConstruccion }],
  },
  {
    path: 'admin',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'admin' },
    children: [{ path: '**', component: EnConstruccion }],
  },

  // Cualquier otra ruta
  { path: '**', component: NoEncontrada },
];
