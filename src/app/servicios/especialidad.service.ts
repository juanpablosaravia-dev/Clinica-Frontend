import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatosEspecialidad, Especialidad } from '../modelos/especialidad';
import { RespuestaApi } from '../modelos/respuesta-api';

// Mismo esquema que SedeService, pero contra /especialidades.
@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/especialidades`;

  listar(): Observable<Especialidad[]> {
    return this.http
      .get<RespuestaApi<Especialidad[]>>(this.url)
      .pipe(map((respuesta) => respuesta.datos));
  }

  crear(datos: DatosEspecialidad): Observable<Especialidad> {
    return this.http
      .post<RespuestaApi<Especialidad>>(this.url, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  actualizar(id: number, datos: DatosEspecialidad): Observable<Especialidad> {
    return this.http
      .put<RespuestaApi<Especialidad>>(`${this.url}/${id}`, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Si la especialidad tiene médicos asociados, el backend responde 409.
  eliminar(id: number): Observable<RespuestaApi<{ mensaje: string }>> {
    return this.http.delete<RespuestaApi<{ mensaje: string }>>(`${this.url}/${id}`);
  }
}
