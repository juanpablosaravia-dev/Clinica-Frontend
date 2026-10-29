import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Footer con los datos de contacto de la clínica (lo pide la consigna de la semana 1).
// Es solo presentación: no tiene lógica, por eso la clase está vacía.
@Component({
  selector: 'app-footer',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
