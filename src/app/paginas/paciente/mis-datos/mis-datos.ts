import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cobertura } from '../../../modelos/cobertura';
import { DatosMisDatos, Usuario } from '../../../modelos/usuario';
import { AuthService } from '../../../servicios/auth.service';
import { CoberturaService } from '../../../servicios/cobertura.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Validador propio: las dos contraseñas tienen que coincidir.
const validarPasswords: ValidatorFn = (grupo) => {
  const password = grupo.get('password')?.value;
  const repetir = grupo.get('repetirPassword')?.value;
  return password !== repetir ? { passwordsDistintas: true } : null;
};

// "Mis datos personales": muestra todo, pero solo se pueden modificar email,
// contraseña, teléfono y cobertura. El resto se muestra en modo lectura.
@Component({
  selector: 'app-mis-datos',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './mis-datos.html',
})
export class MisDatos implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);
  private snackBar = inject(MatSnackBar);

  perfil = signal<Usuario | null>(null);
  coberturas = signal<Cobertura[]>([]);
  guardando = signal(false);

  // La contraseña es opcional: si se deja vacía, no se cambia.
  formulario = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
      telefono: ['', Validators.pattern(/^\d{0,10}$/)],
      id_cobertura: [0, Validators.min(1)],
      password: ['', Validators.minLength(6)],
      repetirPassword: [''],
    },
    { validators: validarPasswords },
  );

  ngOnInit(): void {
    this.coberturaService.listar().subscribe((coberturas) => this.coberturas.set(coberturas));
    this.auth.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        // patchValue carga en el formulario solo los campos que le pasamos.
        this.formulario.patchValue({
          email: perfil.email,
          telefono: perfil.telefono ?? '',
          id_cobertura: perfil.id_cobertura ?? 0,
        });
      },
      error: (error) => this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 }),
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { email, telefono, id_cobertura, password } = this.formulario.getRawValue();
    const datos: DatosMisDatos = { email, telefono, id_cobertura };
    if (password) {
      datos.password = password;
    }

    this.guardando.set(true);
    this.auth.actualizarMisDatos(datos).subscribe({
      next: (perfil) => {
        this.guardando.set(false);
        this.perfil.set(perfil);
        this.formulario.patchValue({ password: '', repetirPassword: '' });
        this.snackBar.open('Datos actualizados', 'Cerrar', { duration: 4000 });
      },
      error: (error) => {
        this.guardando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
