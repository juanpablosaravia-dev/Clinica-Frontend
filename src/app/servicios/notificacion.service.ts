import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../modelos/notificacion';
import { RespuestaApi } from '../modelos/respuesta-api';

// Este servicio no solo hace peticiones: también GUARDA las notificaciones en un signal.
// Como hay una sola instancia para toda la app (providedIn: 'root'), el header y
// cualquier pantalla ven los mismos datos. Es una forma de comunicar componentes
// que no son padre e hijo: los dos leen y modifican el mismo servicio.
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/notificaciones`;

  // El backend ya las devuelve de la más reciente a la más antigua.
  notificaciones = signal<Notificacion[]>([]);

  // Se recalcula sola cada vez que cambia "notificaciones".
  noLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);

  // Pide las notificaciones al backend y las guarda en el signal.
  // Si falla (por ejemplo, backend caído) no se muestra nada: la campana queda como estaba.
  cargar(): void {
    this.http
      .get<RespuestaApi<Notificacion[]>>(this.url)
      .pipe(map((respuesta) => respuesta.datos))
      .subscribe({
        next: (notificaciones) => this.notificaciones.set(notificaciones),
        error: () => {},
      });
  }

  // Marca una como leída. Si el backend responde bien, se actualiza solo esa
  // notificación en el signal y el contador baja al instante.
  marcarLeida(notificacion: Notificacion): void {
    this.http.patch(`${this.url}/${notificacion.id}/leer`, {}).subscribe({
      next: () =>
        // update() recibe el valor actual y devuelve el nuevo.
        this.notificaciones.update((lista) =>
          lista.map((n) => (n.id === notificacion.id ? { ...n, leida: 1 } : n)),
        ),
      error: () => {},
    });
  }

  // Al cerrar sesión se vacía la lista.
  limpiar(): void {
    this.notificaciones.set([]);
  }
}
