import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cobertura, DatosCobertura } from '../modelos/cobertura';
import { RespuestaApi } from '../modelos/respuesta-api';

@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/coberturas`;

  // GET /coberturas es público: se usa en el registro de pacientes y en la pantalla del admin.
  listar(): Observable<Cobertura[]> {
    return this.http
      .get<RespuestaApi<Cobertura[]>>(this.url)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Alta, modificación y baja: solo rol admin (el token lo agrega el interceptor).
  crear(datos: DatosCobertura): Observable<Cobertura> {
    return this.http
      .post<RespuestaApi<Cobertura>>(this.url, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  actualizar(id: number, datos: DatosCobertura): Observable<Cobertura> {
    return this.http
      .put<RespuestaApi<Cobertura>>(`${this.url}/${id}`, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // Si algún usuario tiene esta cobertura, el backend responde 409.
  eliminar(id: number): Observable<RespuestaApi<{ mensaje: string }>> {
    return this.http.delete<RespuestaApi<{ mensaje: string }>>(`${this.url}/${id}`);
  }
}
