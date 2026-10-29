import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GestorAgenda } from '../../../componentes/gestor-agenda/gestor-agenda';
import { AuthService } from '../../../servicios/auth.service';
import { fechaDeHoy } from '../../../utilidades/fechas';

// "Mi agenda" del médico: por defecto la del día actual, con un selector de fecha.
// La tabla y el alta/modificación/baja de rangos los resuelve el componente
// reutilizable GestorAgenda. Esta página solo maneja la fecha elegida.
@Component({
  selector: 'app-mi-agenda',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, GestorAgenda],
  template: `
    <mat-card class="pagina">
      <mat-card-header>
        <mat-card-title>Mi agenda</mat-card-title>
        <mat-card-subtitle>Podés cargar más de un rango horario por día y en distintas sedes</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline">
          <mat-label>Fecha</mat-label>
          <!-- [value] muestra el signal en el input; (change) lo actualiza cuando se elige otra fecha -->
          <input matInput type="date" #campoFecha [value]="fecha()" (change)="fecha.set(campoFecha.value)" />
        </mat-form-field>

        @if (auth.usuario(); as usuario) {
          <!-- Cuando cambia fecha(), el input del hijo cambia y su effect() recarga la tabla -->
          <app-gestor-agenda
            [idMedico]="usuario.id"
            [fecha]="fecha()"
            [idSedePreseleccionada]="usuario.id_sede"
          />
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class MiAgenda {
  auth = inject(AuthService);
  fecha = signal(fechaDeHoy());
}
