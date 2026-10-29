import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BuscadorPaciente } from '../../../componentes/buscador-paciente/buscador-paciente';
import { SolicitudTurno } from '../../../componentes/solicitud-turno/solicitud-turno';
import { PacienteEncontrado } from '../../../modelos/usuario';
import { AuthService } from '../../../servicios/auth.service';

// Asignar turno (operador): busca al paciente y le asigna un turno con el MISMO
// flujo que "Nuevo turno" del paciente (componente SolicitudTurno), con la sede
// fija en la del operador.
@Component({
  selector: 'app-asignar-turno',
  imports: [MatCardModule, MatButtonModule, MatIconModule, BuscadorPaciente, SolicitudTurno],
  template: `
    <div class="pagina">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Asignar turno</mat-card-title>
          <mat-card-subtitle>Buscá al paciente y elegí el turno en tu sede</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (paciente(); as elegido) {
            <div class="paciente-elegido">
              <mat-icon>person</mat-icon>
              <span>
                <strong>{{ elegido.apellido }}, {{ elegido.nombre }}</strong>
                · DNI {{ elegido.dni }} · {{ elegido.cobertura ?? 'Sin cobertura' }}
              </span>
              <button mat-button (click)="paciente.set(null)">Cambiar paciente</button>
            </div>
          } @else {
            <app-buscador-paciente (seleccionado)="paciente.set($event)" />
          }
        </mat-card-content>
      </mat-card>

      @if (paciente(); as elegido) {
        <mat-card>
          <mat-card-content>
            <!-- Tres property bindings hacia los input() del componente reutilizable -->
            <app-solicitud-turno
              [idPaciente]="elegido.id"
              [cobertura]="elegido.cobertura"
              [sedeFija]="miSede"
              (turnoCreado)="paciente.set(null)"
            />
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class AsignarTurno {
  private auth = inject(AuthService);

  miSede = this.auth.usuario()?.id_sede ?? null;
  paciente = signal<PacienteEncontrado | null>(null);
}
