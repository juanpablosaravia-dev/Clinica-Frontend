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
import { Cobertura } from '../../../modelos/cobertura';
import { CoberturaService } from '../../../servicios/cobertura.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// ABM de coberturas (solo rol admin).
// Funciona igual que la pantalla de sedes (ver sedes.ts, que está explicada paso a paso);
// la cobertura tiene un solo campo: "nombre".
@Component({
  selector: 'app-coberturas',
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
  templateUrl: './coberturas.html',
})
export class Coberturas implements OnInit {
  private fb = inject(FormBuilder);
  private coberturaService = inject(CoberturaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private formularioHtml = viewChild.required(FormGroupDirective);

  // Estado de la pantalla (signals)
  coberturas = signal<Cobertura[]>([]);
  filtro = signal('');
  cargando = signal(false);
  guardando = signal(false);
  coberturaEnEdicion = signal<Cobertura | null>(null);

  columnas = ['nombre', 'acciones'];

  // Listado filtrado por el texto del buscador
  coberturasFiltradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return this.coberturas().filter((cobertura) =>
      cobertura.nombre.toLowerCase().includes(texto),
    );
  });

  // varchar(30) en la base
  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(30)]],
  });

  ngOnInit(): void {
    this.cargarCoberturas();
  }

  cargarCoberturas(): void {
    this.cargando.set(true);
    this.coberturaService.listar().subscribe({
      next: (coberturas) => {
        this.coberturas.set(coberturas);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mostrarMensaje(obtenerMensajeError(error));
      },
    });
  }

  editar(cobertura: Cobertura): void {
    this.coberturaEnEdicion.set(cobertura);
    this.formulario.setValue({ nombre: cobertura.nombre });
  }

  cancelarEdicion(): void {
    this.coberturaEnEdicion.set(null);
    this.formularioHtml().resetForm();
  }

  // Crea o modifica según haya una cobertura en edición.
  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const cobertura = this.coberturaEnEdicion();
    const peticion = cobertura
      ? this.coberturaService.actualizar(cobertura.id, datos)
      : this.coberturaService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarMensaje(cobertura ? 'Cobertura modificada' : 'Cobertura creada');
        this.cancelarEdicion();
        this.cargarCoberturas();
      },
      error: (error) => {
        this.guardando.set(false);
        this.mostrarMensaje(obtenerMensajeError(error));
      },
    });
  }

  // Pide confirmación y después la baja. Si algún paciente usa la cobertura el backend
  // responde 409: se muestra su mensaje y el listado queda como estaba.
  eliminar(cobertura: Cobertura): void {
    this.dialog
      .open(DialogoConfirmacion, {
        data: {
          titulo: 'Eliminar cobertura',
          mensaje: `¿Está seguro de eliminar la cobertura "${cobertura.nombre}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.coberturaService.eliminar(cobertura.id).subscribe({
          next: () => {
            this.mostrarMensaje('Cobertura eliminada');
            if (this.coberturaEnEdicion()?.id === cobertura.id) {
              this.cancelarEdicion();
            }
            this.cargarCoberturas();
          },
          error: (error) => this.mostrarMensaje(obtenerMensajeError(error)),
        });
      });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}
