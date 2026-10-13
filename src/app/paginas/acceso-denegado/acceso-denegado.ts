import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Se muestra cuando un usuario intenta entrar a la sección de otro rol.
@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="tarjeta aviso">
      <div class="placa"><mat-icon>block</mat-icon></div>
      <h2>Acceso denegado</h2>
      <p>No tenés permisos para ver esta sección.</p>
      <a mat-flat-button routerLink="/">Volver al inicio</a>
    </mat-card>
  `,
})
export class AccesoDenegado {}
