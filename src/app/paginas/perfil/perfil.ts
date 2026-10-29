import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Usuario } from '../../modelos/usuario';
import { AuthService } from '../../servicios/auth.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// "Mi perfil": datos del usuario logueado, para cualquier rol.
@Component({
  selector: 'app-perfil',
  imports: [MatCardModule, MatListModule, MatIconModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private auth = inject(AuthService);

  // null mientras se espera la respuesta del backend.
  usuario = signal<Usuario | null>(null);
  // Si falla la petición se guarda el mensaje, así la pantalla no queda en "Cargando..." para siempre.
  error = signal('');

  // Los datos se piden siempre al backend: GET /auth/perfil (con el token).
  ngOnInit(): void {
    this.auth.obtenerPerfil().subscribe({
      next: (usuario) => this.usuario.set(usuario),
      error: (error) => this.error.set(obtenerMensajeError(error)),
    });
  }
}
