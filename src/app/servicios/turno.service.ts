import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaApi } from '../modelos/respuesta-api';
import { DatosAtencion, DatosTurno, RegistroHistorial, Turno } from '../modelos/turno';
import { NotificacionService } from './notificacion.service';

// Turnos: alta, cancelación, atención y los listados de cada rol.
// Qué turnos puede ver o tocar cada usuario lo decide el backend según el token.
@Injectable({ providedIn: 'root' })
export class TurnoService {
  private http = inject(HttpClient);
  // Un servicio puede usar otro servicio: después de confirmar, cancelar o atender
  // un turno se recargan las notificaciones, así el contador de la campana se
  // actualiza sin recargar la página.
  private notificacionService = inject(NotificacionService);
  private url = `${environment.apiUrl}/turnos`;

  // tap() ejecuta algo "al costado" cuando llega la respuesta, sin modificarla.
  crear(datos: DatosTurno): Observable<unknown> {
    return this.http
      .post(this.url, datos)
      .pipe(tap(() => this.notificacionService.cargar()));
  }

  cancelar(id: number): Observable<unknown> {
    return this.http
      .patch(`${this.url}/${id}/cancelar`, {})
      .pipe(tap(() => this.notificacionService.cargar()));
  }

  // Marca el turno como atendido y carga el historial clínico en el mismo paso.
  atender(id: number, datos: DatosAtencion): Observable<unknown> {
    return this.http
      .patch(`${this.url}/${id}/atender`, datos)
      .pipe(tap(() => this.notificacionService.cargar()));
  }

  // Paciente: todos sus turnos, del más próximo al menos próximo.
  misTurnos(): Observable<Turno[]> {
    return this.http
      .get<RespuestaApi<Turno[]>>(`${this.url}/mis-turnos`)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Médico: sus turnos de una fecha, en todas las sedes donde atiende.
  programados(fecha: string): Observable<Turno[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http
      .get<RespuestaApi<Turno[]>>(`${this.url}/programados`, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Operador: los turnos de su sede para una fecha.
  deMiSede(fecha: string): Observable<Turno[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http
      .get<RespuestaApi<Turno[]>>(`${this.url}/sede`, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Médico: historial del paciente, solo de los turnos que atendió él mismo
  // (el backend se encarga de filtrarlo).
  historialDePaciente(idPaciente: number): Observable<RegistroHistorial[]> {
    return this.http
      .get<RespuestaApi<RegistroHistorial[]>>(`${environment.apiUrl}/historial/paciente/${idPaciente}`)
      .pipe(map((respuesta) => respuesta.datos));
  }
}
