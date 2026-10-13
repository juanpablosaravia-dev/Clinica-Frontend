import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Usuario } from '../../modelos/usuario';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [MatCardModule, MatListModule, MatIconModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private auth = inject(AuthService);

  usuario = signal<Usuario | null>(null);

  // Los datos se piden siempre al backend: GET /auth/perfil (con el token).
  ngOnInit(): void {
    this.auth.obtenerPerfil().subscribe((usuario) => this.usuario.set(usuario));
  }
}
