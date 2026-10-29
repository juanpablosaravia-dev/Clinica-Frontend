import { Component, OnInit, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cobertura } from '../../modelos/cobertura';
import { AuthService } from '../../servicios/auth.service';
import { CoberturaService } from '../../servicios/cobertura.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// Formulario de alta de paciente REUTILIZABLE.
// Lo usan dos pantallas distintas, sin duplicar código:
//  - Registro (el paciente se crea su propia cuenta)
//  - Alta de paciente del operador
//
// Comunicación con el componente que lo usa (el "padre"):
//  - input():  datos que entran desde el padre  → <app-formulario-paciente titulo="...">
//  - output(): eventos que salen hacia el padre → <app-formulario-paciente (registrado)="...">
//  - <ng-content>: el padre puede meter botones extra dentro del formulario (ver el HTML).
@Component({
  selector: 'app-formulario-paciente',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './formulario-paciente.html',
})
export class FormularioPaciente implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);
  private snackBar = inject(MatSnackBar);
  private formularioHtml = viewChild.required(FormGroupDirective);

  // Entradas: el padre decide qué título mostrar.
  titulo = input('Crear cuenta de paciente');
  subtitulo = input('');

  // Salida: avisa al padre que el paciente se registró bien.
  // El padre decide qué hacer después (ir al login, mostrar un aviso, etc.).
  registrado = output<void>();

  // Se llena con lo que devuelve GET /coberturas (no se escribe a mano).
  coberturas = signal<Cobertura[]>([]);
  guardando = signal(false);

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(30)]],
    apellido: ['', [Validators.required, Validators.maxLength(30)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fecha_nacimiento: ['', Validators.required],
    id_cobertura: [0, Validators.min(1)],
  });

  ngOnInit(): void {
    this.coberturaService.listar().subscribe({
      next: (coberturas) => this.coberturas.set(coberturas),
      error: (error) => this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 4000 }),
    });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.auth.registrar(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.formularioHtml().resetForm();
        // emit() dispara el evento: se ejecuta lo que el padre puso en (registrado)="...".
        this.registrado.emit();
      },
      // Por ejemplo: "El DNI o Email ya se encuentra registrado".
      error: (error) => {
        this.guardando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
