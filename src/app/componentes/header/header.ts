import { Component, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Notificacion } from '../../modelos/notificacion';
import { AuthService } from '../../servicios/auth.service';
import { NotificacionService } from '../../servicios/notificacion.service';

// Nombre del "sector" que se muestra en la franja de color de cada rol.
const NOMBRE_SECTOR: Record<string, string> = {
  paciente: 'Sector pacientes',
  medico: 'Sector médicos',
  operador: 'Sector operadores',
  admin: 'Administración',
};

@Component({
  selector: 'app-header',
  imports: [
    DatePipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  auth = inject(AuthService);
  // El header lee las notificaciones del servicio compartido: si otra pantalla
  // las recarga (por ejemplo, después de cancelar un turno), la campana se entera sola.
  notificacionService = inject(NotificacionService);
  nombreSector = NOMBRE_SECTOR;

  // output() = evento propio del componente. El padre (app.html) lo escucha con
  // (alternarMenu)="..." y abre o cierra el menú lateral. Es la comunicación hijo → padre.
  alternarMenu = output<void>();

  marcarLeida(notificacion: Notificacion, evento: Event): void {
    // Sin esto, el click también cerraría el menú desplegable.
    evento.stopPropagation();
    this.notificacionService.marcarLeida(notificacion);
  }
}
