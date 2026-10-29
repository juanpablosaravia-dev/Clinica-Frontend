import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaApi } from '../modelos/respuesta-api';
import { DatosSede, Sede } from '../modelos/sede';

// Un "servicio" es una clase que agrupa la comunicación con el backend.
// Los componentes (pantallas) no hacen peticiones HTTP directamente: le piden los datos al servicio.
// @Injectable({ providedIn: 'root' }) significa que Angular crea UNA sola instancia
// para toda la aplicación y se la entrega a quien la pida con inject(SedeService).
@Injectable({ providedIn: 'root' })
export class SedeService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/sedes`;

  // Las peticiones devuelven un Observable: la petición recién se envía cuando
  // alguien hace .subscribe(). Con map() nos quedamos solo con "datos" de la respuesta.
  listar(): Observable<Sede[]> {
    return this.http
      .get<RespuestaApi<Sede[]>>(this.url)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // POST /sedes
  crear(datos: DatosSede): Observable<Sede> {
    return this.http
      .post<RespuestaApi<Sede>>(this.url, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // PUT /sedes/:id
  actualizar(id: number, datos: DatosSede): Observable<Sede> {
    return this.http
      .put<RespuestaApi<Sede>>(`${this.url}/${id}`, datos)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // DELETE /sedes/:id
  // Si la sede tiene médicos, operadores o agenda, el backend responde 409 con el motivo.
  eliminar(id: number): Observable<RespuestaApi<{ mensaje: string }>> {
    return this.http.delete<RespuestaApi<{ mensaje: string }>>(`${this.url}/${id}`);
  }
}
