import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../servicios/auth.service';

interface OpcionMenu {
  texto: string;
  icono: string;
  ruta: string;
}

// Opciones de cada rol. Las de semanas futuras llevan a "En construcción".
const OPCIONES_POR_ROL: Record<string, OpcionMenu[]> = {
  paciente: [
    { texto: 'Sacar turno', icono: 'event_available', ruta: '/paciente/sacar-turno' },
    { texto: 'Mis turnos', icono: 'event_note', ruta: '/paciente/mis-turnos' },
    { texto: 'Mi historial clínico', icono: 'history', ruta: '/paciente/historial' },
  ],
  medico: [
    { texto: 'Mi agenda', icono: 'calendar_month', ruta: '/medico/agenda' },
    { texto: 'Turnos programados', icono: 'event_note', ruta: '/medico/turnos' },
    { texto: 'Historial de pacientes', icono: 'history', ruta: '/medico/historial' },
  ],
  operador: [
    { texto: 'Agenda médica', icono: 'calendar_month', ruta: '/operador/agenda' },
    { texto: 'Dar turno', icono: 'event_available', ruta: '/operador/dar-turno' },
    { texto: 'Turnos de la sede', icono: 'event_note', ruta: '/operador/turnos' },
  ],
  admin: [
    { texto: 'Sedes', icono: 'apartment', ruta: '/admin/sedes' },
    { texto: 'Especialidades', icono: 'medical_services', ruta: '/admin/especialidades' },
    { texto: 'Coberturas', icono: 'health_and_safety', ruta: '/admin/coberturas' },
    { texto: 'Auditoría', icono: 'fact_check', ruta: '/admin/auditoria' },
    { texto: 'Reportes', icono: 'bar_chart', ruta: '/admin/reportes' },
  ],
};

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  auth = inject(AuthService);

  // Se recalcula sola cuando cambia el usuario logueado.
  opciones = computed(() => {
    const rol = this.auth.obtenerRol();
    return rol ? OPCIONES_POR_ROL[rol] : [];
  });
}
