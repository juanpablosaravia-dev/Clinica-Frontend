import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cobertura } from '../modelos/cobertura';
import { RespuestaApi } from '../modelos/respuesta-api';

@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private http = inject(HttpClient);

  // GET /coberturas es público: se usa en el registro de pacientes.
  listar(): Observable<Cobertura[]> {
    return this.http
      .get<RespuestaApi<Cobertura[]>>(`${environment.apiUrl}/coberturas`)
      .pipe(map((respuesta) => respuesta.datos));
  }
}
