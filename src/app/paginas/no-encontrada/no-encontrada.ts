import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Se muestra para cualquier ruta que no exista.
@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="tarjeta aviso">
      <div class="placa"><mat-icon>search_off</mat-icon></div>
      <h2>Página no encontrada</h2>
      <p>La dirección que ingresaste no existe.</p>
      <a mat-flat-button routerLink="/">Volver al inicio</a>
    </mat-card>
  `,
})
export class NoEncontrada {}
