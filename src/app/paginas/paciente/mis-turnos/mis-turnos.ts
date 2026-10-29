import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogoConfirmacion } from '../../../componentes/dialogo-confirmacion/dialogo-confirmacion';
import { Turno } from '../../../modelos/turno';
import { TurnoService } from '../../../servicios/turno.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// "Mis turnos" del paciente: lista desplegable (mat-expansion-panel), del turno
// más próximo al menos próximo. El estado se distingue con un chip de color.
@Component({
  selector: 'app-mis-turnos',
  imports: [
    DatePipe,
    TitleCasePipe,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './mis-turnos.html',
})
export class MisTurnos implements OnInit {
  private turnoService = inject(TurnoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  turnos = signal<Turno[]>([]);
  cargando = signal(false);

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.cargando.set(true);
    this.turnoService.misTurnos().subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }

  cancelar(turno: Turno): void {
    this.dialog
      .open(DialogoConfirmacion, {
        data: {
          titulo: 'Cancelar turno',
          mensaje: `¿Está seguro de cancelar el turno del ${turno.fecha.split('-').reverse().join('/')} a las ${turno.hora}?`,
          textoBoton: 'Sí, cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        // TurnoService recarga las notificaciones después de cancelar:
        // el contador de la campana se actualiza sin recargar la página.
        this.turnoService.cancelar(turno.id).subscribe({
          next: () => {
            this.snackBar.open('Turno cancelado', 'Cerrar', { duration: 4000 });
            this.cargarTurnos();
          },
          error: (error) =>
            this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
