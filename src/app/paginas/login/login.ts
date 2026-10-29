import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../servicios/auth.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// Pantalla de login con DNI y contraseña.
// El trabajo de verdad lo hace AuthService.login(): pide el token, lo guarda en
// localStorage y después trae el perfil. Esta pantalla solo valida el formulario
// y muestra el resultado.
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // nonNullable: al resetear, los campos vuelven a '' y no a null.
  // El DNI tiene que ser de 7 u 8 números (mismo criterio que el registro).
  formulario = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    password: ['', Validators.required],
  });

  ingresar(): void {
    // Si hay errores no se llama al backend: se marcan los campos para mostrar los mensajes.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { dni, password } = this.formulario.getRawValue();
    // login() devuelve un Observable: no pasa nada hasta que alguien se suscribe.
    this.auth.login(dni, password).subscribe({
      next: (usuario) => {
        this.snackBar.open(`Bienvenido/a ${usuario.nombre}`, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/']);
      },
      // Con DNI o contraseña incorrectos el backend responde 401 "Credenciales inválidas".
      // Si el backend está apagado, obtenerMensajeError devuelve "No se pudo conectar con el servidor".
      error: (error) => this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 4000 }),
    });
  }
}
