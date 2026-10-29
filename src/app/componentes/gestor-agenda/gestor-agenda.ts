import { Component, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Agenda } from '../../modelos/agenda';
import { Especialidad } from '../../modelos/especialidad';
import { Sede } from '../../modelos/sede';
import { AgendaService } from '../../servicios/agenda.service';
import { MedicoService } from '../../servicios/medico.service';
import { SedeService } from '../../servicios/sede.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';
import { DialogoAgenda, DatosDialogoAgenda } from '../dialogo-agenda/dialogo-agenda';
import { DialogoConfirmacion } from '../dialogo-confirmacion/dialogo-confirmacion';

// Muestra y administra los rangos horarios de UN médico en UNA fecha.
// Es REUTILIZABLE:
//  - "Mi agenda" del médico: puede elegir cualquier sede (atiende en más de una).
//  - Agenda del operador (lápiz / "Nueva agenda"): la sede queda fija en la del operador.
//
// Recibe todo por input() y avisa al padre con el output "cambio" cuando agrega,
// modifica o elimina un rango (así el padre puede refrescar su propia tabla).
@Component({
  selector: 'app-gestor-agenda',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './gestor-agenda.html',
})
export class GestorAgenda {
  private agendaService = inject(AgendaService);
  private medicoService = inject(MedicoService);
  private sedeService = inject(SedeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // input.required: el padre está obligado a pasarlo (si no, no compila).
  idMedico = input.required<number>();
  fecha = input.required<string>();
  // null = el médico elige la sede. Con valor = solo esa sede (operador).
  sedeFija = input<number | null>(null);
  idSedePreseleccionada = input<number | null>(null);

  cambio = output<void>();

  rangos = signal<Agenda[]>([]);
  especialidades = signal<Especialidad[]>([]);
  sedes = signal<Sede[]>([]);
  cargando = signal(false);

  columnas = ['horario', 'especialidad', 'sede', 'acciones'];

  constructor() {
    this.sedeService.listar().subscribe((sedes) => this.sedes.set(sedes));

    // effect() se ejecuta al crear el componente y otra vez cada vez que cambia
    // alguno de los signals que lee. Como lee idMedico() y fecha(), si el padre
    // cambia la fecha (o el médico), la tabla se recarga sola.
    effect(() => {
      this.cargarRangos(this.idMedico(), this.fecha(), this.sedeFija());
    });

    // Las especialidades que se ofrecen son solo las del médico.
    effect(() => {
      const idMedico = this.idMedico();
      this.medicoService.listar().subscribe((medicos) => {
        this.especialidades.set(medicos.find((m) => m.id === idMedico)?.especialidades ?? []);
      });
    });
  }

  agregar(): void {
    this.abrirDialogo(null);
  }

  editar(rango: Agenda): void {
    this.abrirDialogo(rango);
  }

  eliminar(rango: Agenda): void {
    this.dialog
      .open(DialogoConfirmacion, {
        data: {
          titulo: 'Eliminar rango horario',
          mensaje: `¿Está seguro de eliminar el rango de ${rango.hora_entrada} a ${rango.hora_salida}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.agendaService.eliminar(rango.id).subscribe({
          next: () => {
            this.snackBar.open('Rango horario eliminado', 'Cerrar', { duration: 4000 });
            this.recargar();
          },
          // Si tiene turnos confirmados, el backend responde 409 y lo mostramos.
          error: (error) =>
            this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 6000 }),
        });
      });
  }

  private abrirDialogo(rango: Agenda | null): void {
    if (this.especialidades().length === 0) {
      this.snackBar.open('El médico no tiene especialidades asignadas', 'Cerrar', { duration: 4000 });
      return;
    }
    const datos: DatosDialogoAgenda = {
      idMedico: this.idMedico(),
      fecha: this.fecha(),
      rango,
      especialidades: this.especialidades(),
      sedes: this.sedes(),
      idSede: this.sedeFija() ?? this.idSedePreseleccionada(),
      sedeFija: this.sedeFija() !== null,
    };
    this.dialog
      .open(DialogoAgenda, { data: datos, width: '480px' })
      .afterClosed()
      .subscribe((huboCambios) => {
        if (huboCambios) {
          this.recargar();
        }
      });
  }

  private recargar(): void {
    this.cargarRangos(this.idMedico(), this.fecha(), this.sedeFija());
    this.cambio.emit();
  }

  private cargarRangos(idMedico: number, fecha: string, idSede: number | null): void {
    this.cargando.set(true);
    this.agendaService
      .listar({ id_medico: idMedico, fecha, id_sede: idSede ?? undefined })
      .subscribe({
        next: (rangos) => {
          this.rangos.set(rangos);
          this.cargando.set(false);
        },
        error: (error) => {
          this.cargando.set(false);
          this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
        },
      });
  }
}
