import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Header } from './componentes/header/header';
import { Menu } from './componentes/menu/menu';
import { Footer } from './componentes/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Menu, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // En pantallas chicas el menú arranca cerrado y se abre por encima del contenido.
  esCelular = window.innerWidth < 768;
}
