import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cobertura } from '../../modelos/cobertura';
import { AuthService } from '../../servicios/auth.service';
import { CoberturaService } from '../../servicios/cobertura.service';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './registro.html',
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Se llena con lo que devuelve GET /coberturas (no se escribe a mano).
  coberturas = signal<Cobertura[]>([]);

  formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fecha_nacimiento: ['', Validators.required],
    id_cobertura: [0, Validators.min(1)],
  });

  ngOnInit(): void {
    this.coberturaService.listar().subscribe({
      next: (coberturas) => this.coberturas.set(coberturas),
      error: () =>
        this.snackBar.open('No se pudieron cargar las coberturas', 'Cerrar', { duration: 4000 }),
    });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.auth.registrar(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Registro exitoso. Ya podés iniciar sesión', 'Cerrar', {
          duration: 4000,
        });
        this.router.navigate(['/login']);
      },
      // Por ejemplo: "El DNI o Email ya se encuentra registrado".
      error: (error) => {
        const mensaje = error.error?.estado ?? 'No se pudo conectar con el servidor';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
