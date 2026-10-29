import { Routes } from '@angular/router';
import { sesionGuard } from './guards/sesion.guard';
import { rolGuard } from './guards/rol.guard';
import { Inicio } from './paginas/inicio/inicio';
import { Login } from './paginas/login/login';
import { Registro } from './paginas/registro/registro';
import { Perfil } from './paginas/perfil/perfil';
import { AccesoDenegado } from './paginas/acceso-denegado/acceso-denegado';
import { NoEncontrada } from './paginas/no-encontrada/no-encontrada';
import { NuevoTurno } from './paginas/paciente/nuevo-turno/nuevo-turno';
import { MisTurnos } from './paginas/paciente/mis-turnos/mis-turnos';
import { MisDatos } from './paginas/paciente/mis-datos/mis-datos';
import { MiAgenda } from './paginas/medico/mi-agenda/mi-agenda';
import { TurnosProgramados } from './paginas/medico/turnos-programados/turnos-programados';
import { HistorialClinico } from './paginas/medico/historial-clinico/historial-clinico';
import { AgendaTurnos } from './paginas/operador/agenda-turnos/agenda-turnos';
import { AltaPaciente } from './paginas/operador/alta-paciente/alta-paciente';
import { AsignarTurno } from './paginas/operador/asignar-turno/asignar-turno';
import { Sedes } from './paginas/admin/sedes/sedes';
import { Especialidades } from './paginas/admin/especialidades/especialidades';
import { Coberturas } from './paginas/admin/coberturas/coberturas';
import { Usuarios } from './paginas/admin/usuarios/usuarios';
import { Auditoria } from './paginas/admin/auditoria/auditoria';
import { Reportes } from './paginas/admin/reportes/reportes';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'acceso-denegado', component: AccesoDenegado },

  // Cualquier usuario logueado
  { path: 'perfil', component: Perfil, canActivate: [sesionGuard] },

  // Una sección por rol: primero se pide sesión y después el rol indicado en "data".
  // Las rutas hijas heredan esos guards: aunque se escriba la URL a mano,
  // un usuario no puede entrar a la sección de otro rol.
  {
    path: 'paciente',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'paciente' },
    children: [
      { path: 'nuevo-turno', component: NuevoTurno },
      { path: 'mis-turnos', component: MisTurnos },
      { path: 'mis-datos', component: MisDatos },
    ],
  },
  {
    path: 'medico',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'medico' },
    children: [
      { path: 'agenda', component: MiAgenda },
      { path: 'turnos', component: TurnosProgramados },
      { path: 'historial', component: HistorialClinico },
    ],
  },
  {
    path: 'operador',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'operador' },
    children: [
      { path: 'agenda', component: AgendaTurnos },
      { path: 'alta-paciente', component: AltaPaciente },
      { path: 'asignar-turno', component: AsignarTurno },
    ],
  },
  {
    path: 'admin',
    canActivate: [sesionGuard, rolGuard],
    data: { rol: 'admin' },
    children: [
      { path: 'sedes', component: Sedes },
      { path: 'especialidades', component: Especialidades },
      { path: 'coberturas', component: Coberturas },
      { path: 'usuarios', component: Usuarios },
      { path: 'auditoria', component: Auditoria },
      { path: 'reportes', component: Reportes },
    ],
  },

  // Cualquier otra ruta (incluidas las que no existen dentro de una sección)
  { path: '**', component: NoEncontrada },
];
