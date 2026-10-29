import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Agenda } from '../../modelos/agenda';
import { Especialidad } from '../../modelos/especialidad';
import { Sede } from '../../modelos/sede';
import { AgendaService } from '../../servicios/agenda.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// Lo que recibe el diálogo al abrirse.
export interface DatosDialogoAgenda {
  idMedico: number;
  fecha: string;
  rango: Agenda | null; // null = alta de un rango nuevo
  especialidades: Especialidad[]; // solo las del médico
  sedes: Sede[];
  idSede: number | null; // sede preseleccionada
  sedeFija: boolean; // el operador no puede cambiar la sede
}

// Validador PROPIO que mira dos campos a la vez: la hora de salida tiene que ser
// posterior a la de entrada. Devuelve null si está todo bien, o un objeto con el error.
// Las horas 'HH:MM' se pueden comparar como texto ('09:00' < '13:00').
const validarHorario: ValidatorFn = (grupo) => {
  const entrada = grupo.get('hora_entrada')?.value;
  const salida = grupo.get('hora_salida')?.value;
  if (entrada && salida && salida <= entrada) {
    return { horarioInvalido: true };
  }
  return null;
};

// Diálogo para dar de alta o modificar un rango horario de agenda.
// Hace él mismo la petición al backend: si hay un error (por ejemplo 409 porque
// quedarían turnos confirmados afuera) se muestra y el diálogo queda abierto.
@Component({
  selector: 'app-dialogo-agenda',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './dialogo-agenda.html',
})
export class DialogoAgenda {
  private fb = inject(FormBuilder);
  private agendaService = inject(AgendaService);
  private snackBar = inject(MatSnackBar);
  // Referencia al propio diálogo, para cerrarlo desde el código y devolver un resultado.
  private dialogRef = inject(MatDialogRef<DialogoAgenda>);
  datos = inject<DatosDialogoAgenda>(MAT_DIALOG_DATA);

  guardando = signal(false);

  // Si es una modificación, el formulario arranca con los valores del rango;
  // si es un alta, con la fecha elegida y la sede preseleccionada.
  formulario = this.fb.nonNullable.group(
    {
      fecha: [this.datos.rango?.fecha ?? this.datos.fecha, Validators.required],
      hora_entrada: [this.datos.rango?.hora_entrada ?? '', Validators.required],
      hora_salida: [this.datos.rango?.hora_salida ?? '', Validators.required],
      id_especialidad: [
        this.datos.rango?.id_especialidad ?? this.datos.especialidades[0]?.id ?? 0,
        Validators.min(1),
      ],
      id_sede: [this.datos.rango?.id_sede ?? this.datos.idSede ?? 0, Validators.min(1)],
    },
    // El segundo parámetro de group() permite validadores de todo el formulario.
    { validators: validarHorario },
  );

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = { ...this.formulario.getRawValue(), id_medico: this.datos.idMedico };
    const rango = this.datos.rango;
    const peticion = rango
      ? this.agendaService.actualizar(rango.id, datos)
      : this.agendaService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.snackBar.open(rango ? 'Rango horario modificado' : 'Rango horario agregado', 'Cerrar', {
          duration: 4000,
        });
        // close(true) cierra el diálogo y le avisa al que lo abrió que hubo cambios.
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.guardando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 6000 });
      },
    });
  }
}
