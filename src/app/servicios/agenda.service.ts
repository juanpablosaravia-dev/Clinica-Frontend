import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Agenda, DatosAgenda } from '../modelos/agenda';
import { RespuestaApi } from '../modelos/respuesta-api';

// Filtros opcionales de GET /agenda.
export interface FiltrosAgenda {
  fecha?: string;
  id_sede?: number;
  id_medico?: number;
}

// Agenda médica (rangos horarios) y consulta de disponibilidad para pedir turnos.
// Las reglas (quién puede tocar qué agenda, superposiciones, turnos confirmados)
// las valida el backend; si algo no se permite responde 403 o 409 con el motivo
// y la pantalla lo muestra.
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/agenda`;
  private urlDisponibilidad = `${environment.apiUrl}/disponibilidad`;

  // Para el médico, el backend devuelve siempre su propia agenda.
  listar(filtros: FiltrosAgenda): Observable<Agenda[]> {
    let params = new HttpParams();
    if (filtros.fecha) {
      params = params.set('fecha', filtros.fecha);
    }
    if (filtros.id_sede) {
      params = params.set('id_sede', filtros.id_sede);
    }
    if (filtros.id_medico) {
      params = params.set('id_medico', filtros.id_medico);
    }
    return this.http
      .get<RespuestaApi<Agenda[]>>(this.url, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Si el médico ya tiene otro rango ese día que se cruza con este (en cualquier sede), responde 409.
  crear(datos: DatosAgenda): Observable<Agenda> {
    return this.http
      .post<RespuestaApi<Agenda>>(this.url, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Si dejaría turnos confirmados fuera del horario, el backend responde 409.
  actualizar(id: number, datos: DatosAgenda): Observable<Agenda> {
    return this.http
      .put<RespuestaApi<Agenda>>(`${this.url}/${id}`, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Si el rango tiene turnos confirmados, el backend responde 409.
  eliminar(id: number): Observable<RespuestaApi<{ mensaje: string }>> {
    return this.http.delete<RespuestaApi<{ mensaje: string }>>(`${this.url}/${id}`);
  }

  // Fechas (de hoy en adelante) en que el médico tiene agenda para esa especialidad y sede.
  fechasDisponibles(idMedico: number, idEspecialidad: number, idSede: number): Observable<string[]> {
    const params = new HttpParams()
      .set('id_medico', idMedico)
      .set('id_especialidad', idEspecialidad)
      .set('id_sede', idSede);
    return this.http
      .get<RespuestaApi<string[]>>(`${this.urlDisponibilidad}/fechas`, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Horarios libres de ese día (turnos de 30 minutos menos los ya ocupados).
  horariosDisponibles(
    idMedico: number,
    idEspecialidad: number,
    idSede: number,
    fecha: string,
  ): Observable<string[]> {
    const params = new HttpParams()
      .set('id_medico', idMedico)
      .set('id_especialidad', idEspecialidad)
      .set('id_sede', idSede)
      .set('fecha', fecha);
    return this.http
      .get<RespuestaApi<string[]>>(`${this.urlDisponibilidad}/horarios`, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }
}
