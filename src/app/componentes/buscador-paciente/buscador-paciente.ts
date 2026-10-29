import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PacienteEncontrado } from '../../modelos/usuario';
import { PacienteService } from '../../servicios/paciente.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// Buscador de pacientes por DNI o apellido, REUTILIZABLE.
// Lo usan el médico (historial clínico) y el operador (asignar turno).
// Cuando el usuario elige un paciente de la lista, se lo avisa al padre con el output "seleccionado".
@Component({
  selector: 'app-buscador-paciente',
  // FormsModule trae [(ngModel)], la forma más simple de conectar un input con una variable.
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
  ],
  template: `
    <!-- (ngSubmit) se dispara con el botón o al apretar Enter -->
    <form class="fila-filtros" (ngSubmit)="buscar()">
      <mat-form-field appearance="outline">
        <mat-label>DNI o apellido del paciente</mat-label>
        <!-- [(ngModel)] es "two-way binding" (banana in a box):
             lo que se escribe va a "texto" y si "texto" cambia, se ve en el input -->
        <input matInput name="busqueda" [(ngModel)]="texto" />
      </mat-form-field>
      <button mat-flat-button type="submit">
        <mat-icon>search</mat-icon>
        Buscar
      </button>
    </form>

    @if (cargando()) {
      <mat-progress-bar mode="indeterminate" />
    }

    @if (buscado() && !cargando()) {
      @if (resultados().length === 0) {
        <p class="vacio">No se encontraron pacientes.</p>
      } @else {
        <mat-nav-list>
          @for (paciente of resultados(); track paciente.id) {
            <a mat-list-item (click)="seleccionado.emit(paciente)">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>{{ paciente.apellido }}, {{ paciente.nombre }}</span>
              <span matListItemLine>DNI {{ paciente.dni }} · {{ paciente.cobertura ?? 'Sin cobertura' }}</span>
            </a>
          }
        </mat-nav-list>
      }
    }
  `,
})
export class BuscadorPaciente {
  private pacienteService = inject(PacienteService);
  private snackBar = inject(MatSnackBar);

  // Salida: el paciente elegido viaja al padre como dato del evento ($event).
  seleccionado = output<PacienteEncontrado>();

  texto = '';
  resultados = signal<PacienteEncontrado[]>([]);
  cargando = signal(false);
  buscado = signal(false);

  buscar(): void {
    if (this.texto.trim() === '') {
      this.snackBar.open('Escribí un DNI o un apellido', 'Cerrar', { duration: 3000 });
      return;
    }
    this.cargando.set(true);
    this.pacienteService.buscar(this.texto.trim()).subscribe({
      next: (pacientes) => {
        this.resultados.set(pacientes);
        this.cargando.set(false);
        this.buscado.set(true);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
