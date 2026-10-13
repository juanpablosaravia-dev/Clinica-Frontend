import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../servicios/auth.service';

// Nombre del "sector" que se muestra en la franja de color de cada rol.
const NOMBRE_SECTOR: Record<string, string> = {
  paciente: 'Sector pacientes',
  medico: 'Sector médicos',
  operador: 'Sector operadores',
  admin: 'Administración',
};

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  auth = inject(AuthService);
  nombreSector = NOMBRE_SECTOR;

  // Avisa al layout que hay que abrir/cerrar el menú lateral.
  alternarMenu = output<void>();
}
