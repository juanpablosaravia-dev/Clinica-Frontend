import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaApi } from '../modelos/respuesta-api';
import { PacienteEncontrado } from '../modelos/usuario';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pacientes`;

  // Busca por DNI exacto o por apellido (operador, médico y admin).
  buscar(busqueda: string): Observable<PacienteEncontrado[]> {
    const params = new HttpParams().set('busqueda', busqueda);
    return this.http
      .get<RespuestaApi<PacienteEncontrado[]>>(this.url, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }
}
