import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { FiltrosAuditoria, RegistroAuditoria } from '../modelos/auditoria';
import { RespuestaApi } from '../modelos/respuesta-api';

// Registro de auditoría (solo admin): GET /auditoria.
// El backend ya lo devuelve ordenado del más reciente al más antiguo.
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auditoria`;

  // Solo se agregan a la URL los filtros que tienen valor.
  // HttpParams es "inmutable": set() no lo modifica, devuelve uno nuevo. Por eso se reasigna.
  listar(filtros: FiltrosAuditoria): Observable<RegistroAuditoria[]> {
    let params = new HttpParams();
    if (filtros.id_usuario) {
      params = params.set('id_usuario', filtros.id_usuario);
    }
    if (filtros.entidad) {
      params = params.set('entidad', filtros.entidad);
    }
    if (filtros.desde) {
      params = params.set('desde', filtros.desde);
    }
    if (filtros.hasta) {
      params = params.set('hasta', filtros.hasta);
    }
    return this.http
      .get<RespuestaApi<RegistroAuditoria[]>>(this.url, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }
}
