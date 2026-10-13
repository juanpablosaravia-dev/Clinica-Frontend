import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './inicio.html',
})
export class Inicio {
  auth = inject(AuthService);
}
