import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogoConfirmacion } from '../../../componentes/dialogo-confirmacion/dialogo-confirmacion';
import { Especialidad } from '../../../modelos/especialidad';
import { EspecialidadService } from '../../../servicios/especialidad.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// ABM de especialidades (solo rol admin).
// Funciona igual que la pantalla de sedes (ver sedes.ts, que está explicada paso a paso);
// la única diferencia es que la especialidad tiene un solo campo: "descripcion".
@Component({
  selector: 'app-especialidades',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './especialidades.html',
})
export class Especialidades implements OnInit {
  private fb = inject(FormBuilder);
  private especialidadService = inject(EspecialidadService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private formularioHtml = viewChild.required(FormGroupDirective);

  // Estado de la pantalla (signals)
  especialidades = signal<Especialidad[]>([]);
  filtro = signal('');
  cargando = signal(false);
  guardando = signal(false);
  especialidadEnEdicion = signal<Especialidad | null>(null);

  columnas = ['descripcion', 'acciones'];

  // Listado filtrado por el texto del buscador
  especialidadesFiltradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return this.especialidades().filter((especialidad) =>
      especialidad.descripcion.toLowerCase().includes(texto),
    );
  });

  // varchar(30) en la base
  formulario = this.fb.nonNullable.group({
    descripcion: ['', [Validators.required, Validators.maxLength(30)]],
  });

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.cargando.set(true);
    this.especialidadService.listar().subscribe({
      next: (especialidades) => {
        this.especialidades.set(especialidades);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mostrarMensaje(obtenerMensajeError(error));
      },
    });
  }

  editar(especialidad: Especialidad): void {
    this.especialidadEnEdicion.set(especialidad);
    this.formulario.setValue({ descripcion: especialidad.descripcion });
  }

  cancelarEdicion(): void {
    this.especialidadEnEdicion.set(null);
    this.formularioHtml().resetForm();
  }

  // Crea o modifica según haya una especialidad en edición.
  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const especialidad = this.especialidadEnEdicion();
    const peticion = especialidad
      ? this.especialidadService.actualizar(especialidad.id, datos)
      : this.especialidadService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarMensaje(especialidad ? 'Especialidad modificada' : 'Especialidad creada');
        this.cancelarEdicion();
        this.cargarEspecialidades();
      },
      error: (error) => {
        this.guardando.set(false);
        this.mostrarMensaje(obtenerMensajeError(error));
      },
    });
  }

  // Pide confirmación y después la baja. Si tiene médicos asociados el backend
  // responde 409: se muestra su mensaje y el listado queda como estaba.
  eliminar(especialidad: Especialidad): void {
    this.dialog
      .open(DialogoConfirmacion, {
        data: {
          titulo: 'Eliminar especialidad',
          mensaje: `¿Está seguro de eliminar la especialidad "${especialidad.descripcion}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.especialidadService.eliminar(especialidad.id).subscribe({
          next: () => {
            this.mostrarMensaje('Especialidad eliminada');
            if (this.especialidadEnEdicion()?.id === especialidad.id) {
              this.cancelarEdicion();
            }
            this.cargarEspecialidades();
          },
          error: (error) => this.mostrarMensaje(obtenerMensajeError(error)),
        });
      });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}
