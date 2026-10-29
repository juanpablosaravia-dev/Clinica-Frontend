import { Component, OnInit, inject, input, output, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { Especialidad } from '../../modelos/especialidad';
import { Medico } from '../../modelos/medico';
import { Sede } from '../../modelos/sede';
import { DatosTurno } from '../../modelos/turno';
import { AgendaService } from '../../servicios/agenda.service';
import { EspecialidadService } from '../../servicios/especialidad.service';
import { MedicoService } from '../../servicios/medico.service';
import { SedeService } from '../../servicios/sede.service';
import { TurnoService } from '../../servicios/turno.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// Posición de cada paso dentro del stepper (empieza en 0).
const PASO_HORARIO = 4;

// Solicitud de turno paso a paso, REUTILIZABLE entre roles:
//  - Paciente ("Nuevo turno"): <app-solicitud-turno [cobertura]="..." />
//  - Operador ("Asignar turno"): <app-solicitud-turno [idPaciente]="..." [cobertura]="..." [sedeFija]="..." />
//
// Pasos: especialidad → sede → médico → fecha → horario → nota y confirmación.
// Cada paso filtra las opciones del siguiente pidiéndolas al backend.
@Component({
  selector: 'app-solicitud-turno',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
  ],
  templateUrl: './solicitud-turno.html',
})
export class SolicitudTurno implements OnInit {
  private fb = inject(FormBuilder);
  private especialidadService = inject(EspecialidadService);
  private sedeService = inject(SedeService);
  private medicoService = inject(MedicoService);
  private agendaService = inject(AgendaService);
  private turnoService = inject(TurnoService);
  private snackBar = inject(MatSnackBar);

  // Referencia al <mat-stepper> del HTML, para moverlo de paso desde el código.
  private stepper = viewChild.required(MatStepper);

  // --- Entradas (las manda el componente padre) ---
  // Si es null, el turno es para el paciente logueado. El operador manda el id del paciente.
  idPaciente = input<number | null>(null);
  // La cobertura no se elige: es la registrada por el paciente. Solo se muestra en el resumen.
  cobertura = input<string | null>(null);
  // Si tiene valor, la sede queda fija (el operador solo da turnos en su sede).
  sedeFija = input<number | null>(null);

  // --- Salida: avisa al padre que el turno se creó ---
  turnoCreado = output<void>();

  // Opciones de cada paso
  especialidades = signal<Especialidad[]>([]);
  sedes = signal<Sede[]>([]);
  medicos = signal<Medico[]>([]);
  fechas = signal<string[]>([]);
  horarios = signal<string[]>([]);

  cargando = signal(false);
  guardando = signal(false);

  // Un solo formulario con un campo por paso. Cada <mat-step> valida su campo.
  formulario = this.fb.nonNullable.group({
    id_especialidad: [0, Validators.min(1)],
    id_sede: [0, Validators.min(1)],
    id_medico: [0, Validators.min(1)],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    nota: ['', [Validators.required, Validators.maxLength(40)]],
  });

  ngOnInit(): void {
    this.especialidadService.listar().subscribe({
      next: (especialidades) => this.especialidades.set(especialidades),
      error: (error) => this.mostrarError(error),
    });
    this.sedeService.listar().subscribe({
      next: (sedes) => this.sedes.set(sedes),
      error: (error) => this.mostrarError(error),
    });
    this.aplicarSedeFija();
  }

  // --- Cambios de cada paso: limpian lo que viene después y cargan las opciones siguientes ---

  alCambiarEspecialidad(): void {
    this.limpiarDesdeMedico();
    if (this.formulario.controls.id_sede.value) {
      this.cargarMedicos();
    }
  }

  alCambiarSede(): void {
    this.limpiarDesdeMedico();
    this.cargarMedicos();
  }

  alCambiarMedico(): void {
    this.formulario.patchValue({ fecha: '', hora: '' });
    this.horarios.set([]);
    const { id_medico, id_especialidad, id_sede } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.agendaService.fechasDisponibles(id_medico, id_especialidad, id_sede).subscribe({
      next: (fechas) => {
        this.fechas.set(fechas);
        this.cargando.set(false);
      },
      error: (error) => this.mostrarError(error),
    });
  }

  alCambiarFecha(): void {
    this.formulario.patchValue({ hora: '' });
    this.cargarHorarios();
  }

  // --- Datos para el resumen del último paso ---

  nombreEspecialidad(): string {
    const id = this.formulario.controls.id_especialidad.value;
    return this.especialidades().find((e) => e.id === id)?.descripcion ?? '';
  }

  nombreSede(): string {
    const id = this.formulario.controls.id_sede.value;
    return this.sedes().find((s) => s.id === id)?.nombre ?? '';
  }

  nombreMedico(): string {
    const medico = this.medicos().find((m) => m.id === this.formulario.controls.id_medico.value);
    return medico ? `${medico.nombre} ${medico.apellido}` : '';
  }

  confirmar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos: DatosTurno = this.formulario.getRawValue();
    const idPaciente = this.idPaciente();
    if (idPaciente) {
      datos.id_paciente = idPaciente;
    }

    this.guardando.set(true);
    this.turnoService.crear(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.snackBar.open('Turno confirmado', 'Cerrar', { duration: 4000 });
        this.reiniciar();
        this.turnoCreado.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.mostrarError(error);
        // Si el horario se ocupó mientras tanto (409), se vuelven a pedir los
        // horarios libres y se lleva al usuario al paso de horario para elegir otro.
        if (error.status === 409 || error.status === 400) {
          this.formulario.patchValue({ hora: '' });
          this.cargarHorarios();
          this.stepper().selectedIndex = PASO_HORARIO;
        }
      },
    });
  }

  // Vuelve el stepper al primer paso con todo vacío.
  reiniciar(): void {
    this.stepper().reset();
    this.medicos.set([]);
    this.fechas.set([]);
    this.horarios.set([]);
    this.aplicarSedeFija();
  }

  private aplicarSedeFija(): void {
    const sede = this.sedeFija();
    if (sede) {
      this.formulario.patchValue({ id_sede: sede });
    }
  }

  private limpiarDesdeMedico(): void {
    this.formulario.patchValue({ id_medico: 0, fecha: '', hora: '' });
    this.medicos.set([]);
    this.fechas.set([]);
    this.horarios.set([]);
  }

  // Solo los médicos de la especialidad y la sede elegidas.
  private cargarMedicos(): void {
    const { id_especialidad, id_sede } = this.formulario.getRawValue();
    if (!id_especialidad || !id_sede) {
      return;
    }
    this.cargando.set(true);
    this.medicoService.listar(id_especialidad, id_sede).subscribe({
      next: (medicos) => {
        this.medicos.set(medicos);
        this.cargando.set(false);
      },
      error: (error) => this.mostrarError(error),
    });
  }

  // Solo los horarios libres de ese día.
  private cargarHorarios(): void {
    const { id_medico, id_especialidad, id_sede, fecha } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.agendaService.horariosDisponibles(id_medico, id_especialidad, id_sede, fecha).subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.cargando.set(false);
      },
      error: (error) => this.mostrarError(error),
    });
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.cargando.set(false);
    this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
  }
}
