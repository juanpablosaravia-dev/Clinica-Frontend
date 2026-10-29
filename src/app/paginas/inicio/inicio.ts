import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../servicios/auth.service';

// Pantalla principal. Sin sesión invita a ingresar o registrarse y cuenta qué puede
// hacer un paciente; con sesión muestra un banner de bienvenida e invita a elegir
// una opción del menú.
// Las listas de abajo se recorren con @for en inicio.html (así no se repite HTML).
@Component({
  selector: 'app-inicio',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  auth = inject(AuthService);

  // Fecha de hoy para el banner de bienvenida (el pipe "date" la formatea en el HTML).
  hoy = new Date();

  // Texto de la etiqueta del banner según el rol del usuario logueado.
  nombreSector: Record<string, string> = {
    paciente: 'Sector pacientes',
    medico: 'Sector médicos',
    operador: 'Sector operadores',
    admin: 'Administración',
  };

  // Pasos para empezar a usar la clínica (es una secuencia real, por eso van numerados)
  pasos = [
    { titulo: 'Creá tu cuenta', detalle: 'Con tu DNI, email y cobertura médica.' },
    { titulo: 'Ingresá con tu DNI', detalle: 'Tu sesión queda abierta aunque recargues la página.' },
    { titulo: 'Sacá tu turno', detalle: 'Elegí especialidad, sede, médico y horario.' },
  ];

  // Lo que puede hacer un paciente registrado
  funciones = [
    { icono: 'event_available', texto: 'Sacar turnos con el médico y la sede que prefieras' },
    { icono: 'event_busy', texto: 'Ver tus próximos turnos y cancelarlos si no podés ir' },
    { icono: 'history', texto: 'Consultar tu historial clínico' },
    { icono: 'notifications', texto: 'Recibir avisos cuando se confirma o cancela un turno' },
  ];
}
