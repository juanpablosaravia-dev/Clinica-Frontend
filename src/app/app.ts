import { Component, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter } from 'rxjs';
import { Header } from './componentes/header/header';
import { Menu } from './componentes/menu/menu';
import { Footer } from './componentes/footer/footer';
import { AuthService } from './servicios/auth.service';
import { NotificacionService } from './servicios/notificacion.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Menu, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private router = inject(Router);
  private auth = inject(AuthService);
  private notificacionService = inject(NotificacionService);

  // En pantallas chicas el menú arranca cerrado y se abre por encima del contenido.
  esCelular = window.innerWidth < 768;

  constructor() {
    // Cada vez que el usuario navega a otra pantalla, si tiene sesión, se
    // recargan sus notificaciones. Así ve las que le generaron otros usuarios
    // (por ejemplo, un turno que le canceló el médico) sin recargar la página.
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => {
        if (this.auth.estaLogueado()) {
          this.notificacionService.cargar();
        }
      });

    // effect() se vuelve a ejecutar cada vez que cambia un signal que lee adentro.
    // Acá: cuando el usuario cierra sesión (usuario() pasa a null), se vacían las notificaciones.
    effect(() => {
      if (!this.auth.usuario()) {
        this.notificacionService.limpiar();
      }
    });
  }
}
