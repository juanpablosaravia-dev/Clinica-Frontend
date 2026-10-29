import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Turno } from '../../modelos/turno';
import { TurnoService } from '../../servicios/turno.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// "Marcar como atendido": el médico carga el historial clínico del turno.
// Recibe el turno por MAT_DIALOG_DATA y devuelve true al cerrarse si se guardó.
@Component({
  selector: 'app-dialogo-atender',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Atender a {{ turno.nombre_paciente }} {{ turno.apellido_paciente }}</h2>
    <form [formGroup]="formulario" (ngSubmit)="guardar()">
      <mat-dialog-content class="campos-dialogo">
        <mat-form-field appearance="outline">
          <mat-label>Diagnóstico</mat-label>
          <textarea matInput rows="2" formControlName="diagnostico"></textarea>
          <mat-error>El diagnóstico es obligatorio (máximo 255 caracteres)</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tratamiento</mat-label>
          <textarea matInput rows="2" formControlName="tratamiento"></textarea>
          <mat-error>Máximo 255 caracteres</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput rows="2" formControlName="observaciones"></textarea>
          <mat-error>Máximo 255 caracteres</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="guardando()">Marcar como atendido</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class DialogoAtender {
  private fb = inject(FormBuilder);
  private turnoService = inject(TurnoService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DialogoAtender>);
  turno = inject<Turno>(MAT_DIALOG_DATA);

  guardando = signal(false);

  // varchar(255) en la tabla historial_clinico
  formulario = this.fb.nonNullable.group({
    diagnostico: ['', [Validators.required, Validators.maxLength(255)]],
    tratamiento: ['', Validators.maxLength(255)],
    observaciones: ['', Validators.maxLength(255)],
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.turnoService.atender(this.turno.id, this.formulario.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Turno marcado como atendido', 'Cerrar', { duration: 4000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.guardando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
