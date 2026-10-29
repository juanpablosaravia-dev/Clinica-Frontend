import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaApi } from '../modelos/respuesta-api';
import { DatosMisDatos, DatosRegistro, Rol, Usuario } from '../modelos/usuario';

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${environment.apiUrl}/auth`;

  // Usuario logueado. Arranca con lo que haya en localStorage,
  // así la sesión se mantiene al recargar la página.
  usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  registrar(datos: DatosRegistro): Observable<RespuestaApi<{ mensaje: string; id: number }>> {
    return this.http.post<RespuestaApi<{ mensaje: string; id: number }>>(
      `${this.url}/registro`,
      datos,
    );
  }

  // 1) POST /auth/login devuelve el token y lo guardamos.
  // 2) Con el token pedimos GET /auth/perfil para tener nombre y rol.
  login(dni: string, password: string): Observable<Usuario> {
    return this.http
      .post<RespuestaApi<{ token: string }>>(`${this.url}/login`, { dni, password })
      .pipe(
        tap((respuesta) => localStorage.setItem(CLAVE_TOKEN, respuesta.datos.token)),
        switchMap(() => this.obtenerPerfil()),
        tap((usuario) => {
          localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
          this.usuario.set(usuario);
        }),
      );
  }

  obtenerPerfil(): Observable<Usuario> {
    return this.http
      .get<RespuestaApi<Usuario>>(`${this.url}/perfil`)
      .pipe(map((respuesta) => respuesta.datos));
  }

  // PUT /auth/perfil: el paciente actualiza email, contraseña, teléfono y cobertura.
  // Si sale bien, se actualiza también el usuario guardado (el header usa sus datos).
  actualizarMisDatos(datos: DatosMisDatos): Observable<Usuario> {
    return this.http.put<RespuestaApi<Usuario>>(`${this.url}/perfil`, datos).pipe(
      map((respuesta) => respuesta.datos),
      tap((usuario) => {
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
        this.usuario.set(usuario);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuario.set(null);
    this.router.navigate(['/']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  estaLogueado(): boolean {
    return this.usuario() !== null;
  }

  obtenerRol(): Rol | null {
    return this.usuario()?.rol ?? null;
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    if (!guardado || !localStorage.getItem(CLAVE_TOKEN)) {
      return null;
    }
    return JSON.parse(guardado);
  }
}
