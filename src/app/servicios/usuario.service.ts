import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaApi } from '../modelos/respuesta-api';
import { DatosUsuario, UsuarioCompleto } from '../modelos/usuario';

// Gestión de usuarios (solo admin).
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar(): Observable<UsuarioCompleto[]> {
    return this.http
      .get<RespuestaApi<UsuarioCompleto[]>>(this.url)
      .pipe(map((respuesta) => respuesta.datos));
  }

  crear(datos: DatosUsuario): Observable<unknown> {
    return this.http.post(this.url, datos);
  }

  actualizar(id: number, datos: DatosUsuario): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, datos);
  }
}
