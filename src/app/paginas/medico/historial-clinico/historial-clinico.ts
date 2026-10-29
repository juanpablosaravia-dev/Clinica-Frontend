import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BuscadorPaciente } from '../../../componentes/buscador-paciente/buscador-paciente';
import { RegistroHistorial } from '../../../modelos/turno';
import { PacienteEncontrado } from '../../../modelos/usuario';
import { TurnoService } from '../../../servicios/turno.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Historial clínico (médico): busca un paciente por DNI o apellido y muestra su
// historial. El backend devuelve SOLO los registros de los turnos que atendió el
// médico logueado, así que acá no hace falta filtrar nada.
@Component({
  selector: 'app-historial-clinico',
  imports: [DatePipe, MatCardModule, MatTableModule, MatProgressBarModule, BuscadorPaciente],
  template: `
    <div class="pagina">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Historial clínico</mat-card-title>
          <mat-card-subtitle>Solo se muestran los turnos que atendiste vos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <!-- El buscador emite (seleccionado) con el paciente elegido: llega en $event -->
          <app-buscador-paciente (seleccionado)="verHistorial($event)" />
        </mat-card-content>
      </mat-card>

      @if (paciente(); as paciente) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ paciente.apellido }}, {{ paciente.nombre }}</mat-card-title>
            <mat-card-subtitle>DNI {{ paciente.dni }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (cargando()) {
              <mat-progress-bar mode="indeterminate" />
            } @else if (registros().length === 0) {
              <p class="vacio">No hay registros de turnos atendidos por vos para este paciente.</p>
            } @else {
              <table mat-table [dataSource]="registros()" class="tabla">
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let registro">{{ registro.fecha_registro | date: 'dd/MM/yyyy' }}</td>
                </ng-container>
                <ng-container matColumnDef="diagnostico">
                  <th mat-header-cell *matHeaderCellDef>Diagnóstico</th>
                  <td mat-cell *matCellDef="let registro">{{ registro.diagnostico }}</td>
                </ng-container>
                <ng-container matColumnDef="tratamiento">
                  <th mat-header-cell *matHeaderCellDef>Tratamiento</th>
                  <td mat-cell *matCellDef="let registro">{{ registro.tratamiento || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="observaciones">
                  <th mat-header-cell *matHeaderCellDef>Observaciones</th>
                  <td mat-cell *matCellDef="let registro">{{ registro.observaciones || '-' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="columnas"></tr>
                <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class HistorialClinico {
  private turnoService = inject(TurnoService);
  private snackBar = inject(MatSnackBar);

  paciente = signal<PacienteEncontrado | null>(null);
  registros = signal<RegistroHistorial[]>([]);
  cargando = signal(false);

  columnas = ['fecha', 'diagnostico', 'tratamiento', 'observaciones'];

  verHistorial(paciente: PacienteEncontrado): void {
    this.paciente.set(paciente);
    this.cargando.set(true);
    this.turnoService.historialDePaciente(paciente.id).subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
