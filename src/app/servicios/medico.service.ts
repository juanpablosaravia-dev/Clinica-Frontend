import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Medico } from '../modelos/medico';
import { RespuestaApi } from '../modelos/respuesta-api';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/medicos`;

  // GET /medicos con filtros opcionales.
  // HttpParams arma el "?id_especialidad=1&id_sede=2" de la URL.
  listar(idEspecialidad?: number, idSede?: number): Observable<Medico[]> {
    let params = new HttpParams();
    if (idEspecialidad) {
      params = params.set('id_especialidad', idEspecialidad);
    }
    if (idSede) {
      params = params.set('id_sede', idSede);
    }
    return this.http
      .get<RespuestaApi<Medico[]>>(this.url, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }
}
