import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  auth = inject(AuthService);

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
