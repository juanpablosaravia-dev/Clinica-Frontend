import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Pantalla para las opciones del menú que se completan en semanas futuras.
@Component({
  selector: 'app-en-construccion',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="tarjeta aviso">
      <mat-icon class="icono-grande">construction</mat-icon>
      <h2>En construcción</h2>
      <p>Esta sección va a estar disponible próximamente.</p>
      <a mat-flat-button routerLink="/">Volver al inicio</a>
    </mat-card>
  `,
})
export class EnConstruccion {}
