import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RankingMedico,
  Reportes,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../modelos/reporte';
import { RespuestaApi } from '../modelos/respuesta-api';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/reportes`;

  // Pide los cuatro indicadores con el mismo rango de fechas.
  // forkJoin lanza las cuatro peticiones a la vez y emite UNA sola vez,
  // cuando terminaron todas, con los cuatro resultados juntos.
  obtenerTodos(desde: string, hasta: string): Observable<Reportes> {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }

    return forkJoin({
      porEspecialidad: this.http.get<RespuestaApi<TurnosPorEspecialidad[]>>(
        `${this.url}/turnos-por-especialidad`,
        { params },
      ),
      porSede: this.http.get<RespuestaApi<TurnosPorSede[]>>(`${this.url}/turnos-por-sede`, {
        params,
      }),
      ranking: this.http.get<RespuestaApi<RankingMedico[]>>(`${this.url}/ranking-medicos`, {
        params,
      }),
      cancelacion: this.http.get<RespuestaApi<TasaCancelacion>>(`${this.url}/tasa-cancelacion`, {
        params,
      }),
    }).pipe(
      // De cada respuesta nos quedamos con "datos".
      map((respuestas) => ({
        porEspecialidad: respuestas.porEspecialidad.datos,
        porSede: respuestas.porSede.datos,
        ranking: respuestas.ranking.datos,
        cancelacion: respuestas.cancelacion.datos,
      })),
    );
  }
}
