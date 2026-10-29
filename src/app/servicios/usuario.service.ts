import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaApi } from '../modelos/respuesta-api';
import { DatosUsuario, UsuarioCompleto } from '../modelos/usuario';

// Gestión de usuarios (solo admin): GET, POST y PUT /usuarios.
// El listado viene completo y la pantalla de Usuarios filtra y pagina en el navegador.
// El backend registra cada alta y modificación en la auditoría.
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar(): Observable<UsuarioCompleto[]> {
    return this.http
      .get<RespuestaApi<UsuarioCompleto[]>>(this.url)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // "unknown" porque la pantalla no usa lo que devuelve: después de guardar vuelve a pedir el listado.
  crear(datos: DatosUsuario): Observable<unknown> {
    return this.http.post(this.url, datos);
  }

  actualizar(id: number, datos: DatosUsuario): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, datos);
  }
}
