import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitudTurno } from '../../../componentes/solicitud-turno/solicitud-turno';
import { AuthService } from '../../../servicios/auth.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// "Nuevo turno" del paciente. Todo el paso a paso está en el componente
// reutilizable SolicitudTurno; acá solo buscamos la cobertura del paciente
// (para el resumen) y decidimos qué pasa cuando el turno se crea.
@Component({
  selector: 'app-nuevo-turno',
  imports: [MatCardModule, MatProgressBarModule, SolicitudTurno],
  template: `
    <mat-card class="pagina">
      <mat-card-header>
        <mat-card-title>Nuevo turno</mat-card-title>
        <mat-card-subtitle>Elegí paso a paso el turno que necesitás</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        @if (cargando()) {
          <mat-progress-bar mode="indeterminate" />
        } @else {
          <!-- [cobertura] es un property binding hacia el input() del hijo.
               (turnoCreado) escucha su output(). -->
          <app-solicitud-turno [cobertura]="cobertura()" (turnoCreado)="alCrearTurno()" />
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class NuevoTurno implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  cobertura = signal<string | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    this.auth.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.cobertura.set(perfil.cobertura ?? null);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }

  // Después de sacar el turno, lo llevamos a ver sus turnos.
  alCrearTurno(): void {
    this.router.navigate(['/paciente/mis-turnos']);
  }
}
