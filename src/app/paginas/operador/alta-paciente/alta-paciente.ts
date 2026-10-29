import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormularioPaciente } from '../../../componentes/formulario-paciente/formulario-paciente';

// Alta de pacientes del operador: MISMO formulario y validaciones que el registro
// público, porque reutiliza el componente FormularioPaciente (no hay pantallas duplicadas).
@Component({
  selector: 'app-alta-paciente',
  imports: [FormularioPaciente],
  template: `
    <app-formulario-paciente
      titulo="Alta de paciente"
      subtitulo="El paciente va a poder ingresar con su DNI y la contraseña que cargues"
      (registrado)="alRegistrar()"
    />
  `,
})
export class AltaPaciente {
  private snackBar = inject(MatSnackBar);

  // El formulario ya se limpió solo: el operador puede cargar otro paciente.
  alRegistrar(): void {
    this.snackBar.open('Paciente registrado', 'Cerrar', { duration: 4000 });
  }
}
