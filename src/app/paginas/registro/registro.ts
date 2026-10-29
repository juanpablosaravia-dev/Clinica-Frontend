import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormularioPaciente } from '../../componentes/formulario-paciente/formulario-paciente';

// Registro público de pacientes.
// Todo el formulario vive en el componente reutilizable FormularioPaciente;
// esta página solo decide qué pasa cuando el registro sale bien.
@Component({
  selector: 'app-registro',
  imports: [RouterLink, MatButtonModule, FormularioPaciente],
  template: `
    <!-- (registrado) escucha el output() del componente hijo -->
    <app-formulario-paciente
      titulo="Crear cuenta de paciente"
      subtitulo="Con tu cuenta vas a poder sacar turnos y ver tu historial"
      (registrado)="alRegistrar()"
    >
      <!-- Este link se "proyecta" dentro del <ng-content> del formulario -->
      <a mat-button routerLink="/login">Ya tengo cuenta, ingresar</a>
    </app-formulario-paciente>
  `,
})
export class Registro {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  alRegistrar(): void {
    this.snackBar.open('Cuenta creada. Ya podés ingresar con tu DNI', 'Cerrar', { duration: 4000 });
    this.router.navigate(['/login']);
  }
}
