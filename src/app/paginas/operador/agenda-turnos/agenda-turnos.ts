import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogoConfirmacion } from '../../../componentes/dialogo-confirmacion/dialogo-confirmacion';
import { GestorAgenda } from '../../../componentes/gestor-agenda/gestor-agenda';
import { Agenda } from '../../../modelos/agenda';
import { Medico } from '../../../modelos/medico';
import { Sede } from '../../../modelos/sede';
import { Turno } from '../../../modelos/turno';
import { AgendaService } from '../../../servicios/agenda.service';
import { AuthService } from '../../../servicios/auth.service';
import { MedicoService } from '../../../servicios/medico.service';
import { SedeService } from '../../../servicios/sede.service';
import { TurnoService } from '../../../servicios/turno.service';
import { fechaDeHoy } from '../../../utilidades/fechas';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Médico elegido para editar su agenda o ver sus turnos.
interface MedicoElegido {
  id: number;
  nombre: string;
}

// Agenda y turnos del operador.
// Filtros de fecha (hoy) y sede (la suya). Las acciones (lápiz, ojo y "Nueva agenda")
// solo están disponibles para la sede del operador: las demás se consultan, no se modifican.
@Component({
  selector: 'app-agenda-turnos',
  imports: [
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    GestorAgenda,
  ],
  templateUrl: './agenda-turnos.html',
})
export class AgendaTurnos implements OnInit {
  private auth = inject(AuthService);
  private agendaService = inject(AgendaService);
  private sedeService = inject(SedeService);
  private medicoService = inject(MedicoService);
  private turnoService = inject(TurnoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // La sede del operador sale del usuario logueado.
  miSede = this.auth.usuario()?.id_sede ?? 0;

  fecha = signal(fechaDeHoy());
  sedeFiltro = signal(this.miSede);
  agenda = signal<Agenda[]>([]);
  sedes = signal<Sede[]>([]);
  medicos = signal<Medico[]>([]);
  cargando = signal(false);

  // Panel de edición de agenda (lápiz o "Nueva agenda") y panel de turnos (ojo).
  medicoEnEdicion = signal<MedicoElegido | null>(null);
  medicoTurnos = signal<MedicoElegido | null>(null);
  turnos = signal<Turno[]>([]);
  eligiendoMedico = signal(false);

  columnas = ['medico', 'especialidad', 'horario', 'acciones'];

  // true si la sede que se está mirando es la del operador (y puede modificarla).
  esMiSede = computed(() => this.sedeFiltro() === this.miSede);

  constructor() {
    // Al cambiar cualquiera de los filtros, la tabla se actualiza.
    effect(() => {
      this.cargarAgenda(this.fecha(), this.sedeFiltro());
    });
  }

  ngOnInit(): void {
    this.sedeService.listar().subscribe((sedes) => this.sedes.set(sedes));
    this.medicoService.listar().subscribe((medicos) => this.medicos.set(medicos));
  }

  cambiarFecha(fecha: string): void {
    this.cerrarPaneles();
    this.fecha.set(fecha);
  }

  cambiarSede(idSede: number): void {
    this.cerrarPaneles();
    this.sedeFiltro.set(idSede);
  }

  // Lápiz: editar la agenda de ese médico para esa fecha.
  editarAgenda(fila: Agenda): void {
    this.medicoTurnos.set(null);
    this.medicoEnEdicion.set({ id: fila.id_medico, nombre: `${fila.nombre_medico} ${fila.apellido_medico}` });
  }

  // "Nueva agenda": se elige el médico de un listado, aunque todavía no tenga agenda.
  nuevaAgenda(idMedico: number): void {
    const medico = this.medicos().find((m) => m.id === idMedico);
    if (!medico) {
      return;
    }
    this.eligiendoMedico.set(false);
    this.medicoTurnos.set(null);
    this.medicoEnEdicion.set({ id: medico.id, nombre: `${medico.nombre} ${medico.apellido}` });
  }

  // Ojo: ver los turnos confirmados de ese médico para esa fecha.
  verTurnos(fila: Agenda): void {
    this.medicoEnEdicion.set(null);
    this.medicoTurnos.set({ id: fila.id_medico, nombre: `${fila.nombre_medico} ${fila.apellido_medico}` });
    this.cargarTurnos();
  }

  cancelarTurno(turno: Turno): void {
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
            this.cargarTurnos();
          },
          error: (error) =>
            this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 }),
        });
      });
  }

  // El gestor de agenda avisa con (cambio) que agregó/modificó/eliminó un rango:
  // recargamos la tabla de arriba.
  alCambiarAgenda(): void {
    this.cargarAgenda(this.fecha(), this.sedeFiltro());
  }

  cerrarPaneles(): void {
    this.medicoEnEdicion.set(null);
    this.medicoTurnos.set(null);
    this.eligiendoMedico.set(false);
  }

  private cargarAgenda(fecha: string, idSede: number): void {
    this.cargando.set(true);
    this.agendaService.listar({ fecha, id_sede: idSede }).subscribe({
      next: (agenda) => {
        this.agenda.set(agenda);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }

  // Turnos de la sede del operador, filtrados por médico y estado confirmado.
  private cargarTurnos(): void {
    const medico = this.medicoTurnos();
    if (!medico) {
      return;
    }
    this.turnoService.deMiSede(this.fecha()).subscribe({
      next: (turnos) =>
        this.turnos.set(
          turnos.filter((t) => t.id_medico === medico.id && t.estado === 'confirmado'),
        ),
      error: (error) => this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 }),
    });
  }
}
