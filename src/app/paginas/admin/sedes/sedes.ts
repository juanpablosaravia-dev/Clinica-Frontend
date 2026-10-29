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
import { Sede } from '../../../modelos/sede';
import { SedeService } from '../../../servicios/sede.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Pantalla de administración de sedes (ABM = Alta, Baja y Modificación). Solo rol admin.
//
// Un componente de Angular tiene tres partes:
//  - esta clase (.ts): los datos y las funciones de la pantalla
//  - el template (.html): lo que se ve, conectado a la clase
//  - "imports": los componentes de Angular Material que usa el template
@Component({
  selector: 'app-sedes',
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
  templateUrl: './sedes.html',
})
export class Sedes implements OnInit {
  // inject() le pide a Angular una instancia de cada servicio (inyección de dependencias).
  private fb = inject(FormBuilder);
  private sedeService = inject(SedeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Referencia al <form> del HTML. La usamos para limpiar el formulario después de guardar.
  private formularioHtml = viewChild.required(FormGroupDirective);

  // --- Estado de la pantalla ---
  // Un "signal" es una variable que avisa cuando cambia: Angular vuelve a dibujar
  // automáticamente las partes del HTML que la usan. Se lee con sedes() y se cambia con sedes.set(...).
  sedes = signal<Sede[]>([]);
  filtro = signal('');
  cargando = signal(false);
  guardando = signal(false);
  // Si es null estamos creando una sede nueva; si tiene una sede, la estamos modificando.
  sedeEnEdicion = signal<Sede | null>(null);

  // Columnas de la tabla, en el orden en que se muestran (deben coincidir con matColumnDef del HTML).
  columnas = ['nombre', 'direccion', 'telefono', 'acciones'];

  // "computed" es un signal calculado a partir de otros: se recalcula solo cuando
  // cambian sedes() o filtro(). Así el filtro funciona sin pedir nada al backend.
  sedesFiltradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return this.sedes().filter((sede) =>
      `${sede.nombre} ${sede.direccion} ${sede.telefono}`.toLowerCase().includes(texto),
    );
  });

  // Formulario reactivo: cada campo con su valor inicial y sus validaciones.
  // Los largos máximos son los mismos que las columnas de la tabla "sede" en la base.
  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    direccion: ['', [Validators.required, Validators.maxLength(100)]],
    // Solo números, espacios, guiones, paréntesis y el signo +.
    telefono: [
      '',
      [Validators.required, Validators.maxLength(15), Validators.pattern(/^[\d\s()+-]+$/)],
    ],
  });

  // ngOnInit se ejecuta una vez, cuando Angular termina de crear el componente.
  ngOnInit(): void {
    this.cargarSedes();
  }

  // Pide el listado al backend. Se llama al entrar y después de cada alta, modificación o baja,
  // así la tabla se actualiza sin recargar la página.
  cargarSedes(): void {
    this.cargando.set(true);
    this.sedeService.listar().subscribe({
      next: (sedes) => {
        this.sedes.set(sedes);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mostrarMensaje(obtenerMensajeError(error));
      },
    });
  }

  // Pasa los datos de la fila al formulario para modificarlos.
  editar(sede: Sede): void {
    this.sedeEnEdicion.set(sede);
    this.formulario.setValue({
      nombre: sede.nombre,
      direccion: sede.direccion,
      telefono: sede.telefono,
    });
  }

  // Vuelve el formulario a "Nueva sede" y lo deja vacío.
  // resetForm() además borra el estado "enviado", así no quedan los errores en rojo.
  cancelarEdicion(): void {
    this.sedeEnEdicion.set(null);
    this.formularioHtml().resetForm();
  }

  // Se ejecuta al enviar el formulario: crea o modifica según sedeEnEdicion.
  guardar(): void {
    // Si hay errores no se envía nada: se marcan los campos para que se vean los mensajes.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const sede = this.sedeEnEdicion();
    const peticion = sede
      ? this.sedeService.actualizar(sede.id, datos)
      : this.sedeService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarMensaje(sede ? 'Sede modificada' : 'Sede creada');
        this.cancelarEdicion();
        this.cargarSedes();
      },
      error: (error) => {
        this.guardando.set(false);
        this.mostrarMensaje(obtenerMensajeError(error));
      },
    });
  }

  // Abre el diálogo de confirmación y, solo si el usuario acepta, pide la baja al backend.
  eliminar(sede: Sede): void {
    this.dialog
      .open(DialogoConfirmacion, {
        data: {
          titulo: 'Eliminar sede',
          mensaje: `¿Está seguro de eliminar la sede "${sede.nombre}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }
        this.sedeService.eliminar(sede.id).subscribe({
          next: () => {
            this.mostrarMensaje('Sede eliminada');
            // Si justo la estábamos editando, limpiamos el formulario.
            if (this.sedeEnEdicion()?.id === sede.id) {
              this.cancelarEdicion();
            }
            this.cargarSedes();
          },
          // Si tiene dependencias el backend responde 409 con el motivo.
          // Mostramos ese mensaje y no tocamos el listado.
          error: (error) => this.mostrarMensaje(obtenerMensajeError(error)),
        });
      });
  }

  // Muestra un aviso abajo de la pantalla (snackbar de Angular Material).
  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}
