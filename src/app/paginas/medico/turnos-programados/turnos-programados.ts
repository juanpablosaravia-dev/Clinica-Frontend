import { Component, computed, effect, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogoAtender } from '../../../componentes/dialogo-atender/dialogo-atender';
import { DialogoConfirmacion } from '../../../componentes/dialogo-confirmacion/dialogo-confirmacion';
import { Turno } from '../../../modelos/turno';
import { TurnoService } from '../../../servicios/turno.service';
import { calcularEdad, fechaDeHoy } from '../../../utilidades/fechas';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Turnos del médico para una fecha, en todas las sedes donde atiende.
// Click en una fila: muestra las notas del paciente.
@Component({
  selector: 'app-turnos-programados',
  imports: [
    TitleCasePipe,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  templateUrl: './turnos-programados.html',
})
export class TurnosProgramados {
  private turnoService = inject(TurnoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  fecha = signal(fechaDeHoy());
  // 0 = todas las sedes
  sedeFiltro = signal(0);
  turnos = signal<Turno[]>([]);
  turnoSeleccionado = signal<Turno | null>(null);
  cargando = signal(false);

  columnas = ['hora', 'paciente', 'edad', 'sede', 'estado', 'acciones'];

  // Sedes en las que el médico tiene turnos ese día (para el filtro), sin repetir.
  sedesDelDia = computed(() => {
    const sedes = new Map<number, string>();
    this.turnos().forEach((turno) => sedes.set(turno.id_sede, turno.sede));
    return [...sedes.entries()].map(([id, nombre]) => ({ id, nombre }));
  });

  // Ya vienen ordenados por hora (proximidad); acá solo se filtra por sede.
  turnosFiltrados = computed(() =>
    this.sedeFiltro() === 0
      ? this.turnos()
      : this.turnos().filter((turno) => turno.id_sede === this.sedeFiltro()),
  );

  // Una función de la utilidad que el template puede usar.
  calcularEdad = calcularEdad;

  constructor() {
    // Cada vez que cambia la fecha se vuelven a pedir los turnos.
    effect(() => this.cargarTurnos(this.fecha()));
  }

  cambiarFecha(fecha: string): void {
    this.sedeFiltro.set(0);
    this.turnoSeleccionado.set(null);
    this.fecha.set(fecha);
  }

  seleccionar(turno: Turno): void {
    this.turnoSeleccionado.set(turno);
  }

  atender(turno: Turno, evento: Event): void {
    // Evita que el click en el botón también "seleccione" la fila.
    evento.stopPropagation();
    this.dialog
      .open(DialogoAtender, { data: turno, width: '520px' })
      .afterClosed()
      .subscribe((atendido) => {
        if (atendido) {
          this.cargarTurnos(this.fecha());
        }
      });
  }

  cancelar(turno: Turno, evento: Event): void {
    evento.stopPropagation();
    this.dialog
      .open(DialogoConfirmacion, {
        data: {
          titulo: 'Cancelar turno',
          mensaje: `¿Está seguro de cancelar el turno de ${turno.nombre_paciente} ${turno.apellido_paciente} a las ${turno.hora}?`,
          textoBoton: 'Sí, cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.turnoService.cancelar(turno.id).subscribe({
          next: () => {
            this.snackBar.open('Turno cancelado', 'Cerrar', { duration: 4000 });
            this.cargarTurnos(this.fecha());
          },
          error: (error) =>
            this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 }),
        });
      });
  }

  private cargarTurnos(fecha: string): void {
    this.cargando.set(true);
    this.turnoService.programados(fecha).subscribe({
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
}
