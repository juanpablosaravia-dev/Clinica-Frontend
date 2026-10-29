import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cobertura } from '../../modelos/cobertura';
import { Especialidad } from '../../modelos/especialidad';
import { Sede } from '../../modelos/sede';
import { DatosUsuario, Rol, UsuarioCompleto } from '../../modelos/usuario';
import { CoberturaService } from '../../servicios/cobertura.service';
import { EspecialidadService } from '../../servicios/especialidad.service';
import { SedeService } from '../../servicios/sede.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { obtenerMensajeError } from '../../utilidades/mensaje-error';

// Alta y edición de usuarios (admin).
//  - Alta: operador, médico o administrador. Operador y médico llevan sede;
//    el administrador no. El médico además lleva sus especialidades.
//  - Edición: cualquier tipo de usuario (incluidos pacientes). El rol no se cambia
//    y la contraseña es opcional.
// Recibe el usuario a editar por MAT_DIALOG_DATA (null = alta).
@Component({
  selector: 'app-dialogo-usuario',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './dialogo-usuario.html',
})
export class DialogoUsuario implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private sedeService = inject(SedeService);
  private especialidadService = inject(EspecialidadService);
  private coberturaService = inject(CoberturaService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DialogoUsuario>);
  usuario = inject<UsuarioCompleto | null>(MAT_DIALOG_DATA);

  sedes = signal<Sede[]>([]);
  especialidades = signal<Especialidad[]>([]);
  coberturas = signal<Cobertura[]>([]);
  guardando = signal(false);

  // Roles que el admin puede crear (los pacientes se registran solos).
  rolesAlta: Rol[] = ['operador', 'medico', 'admin'];

  formulario = this.fb.nonNullable.group({
    nombre: [this.usuario?.nombre ?? '', [Validators.required, Validators.maxLength(30)]],
    apellido: [this.usuario?.apellido ?? '', [Validators.required, Validators.maxLength(30)]],
    dni: [this.usuario?.dni ?? '', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    email: [
      this.usuario?.email ?? '',
      [Validators.required, Validators.email, Validators.maxLength(30)],
    ],
    telefono: [this.usuario?.telefono ?? '', Validators.pattern(/^\d{0,10}$/)],
    fecha_nacimiento: [this.usuario?.fecha_nacimiento ?? '', Validators.required],
    rol: [this.usuario?.rol ?? ('operador' as Rol), Validators.required],
    // En el alta la contraseña es obligatoria; en la edición, opcional.
    password: ['', this.usuario ? Validators.minLength(6) : [Validators.required, Validators.minLength(6)]],
    id_sede: [this.usuario?.id_sede ?? 0],
    id_cobertura: [this.usuario?.id_cobertura ?? 0],
    especialidades: [this.usuario?.especialidades.map((e) => e.id) ?? ([] as number[])],
  });

  ngOnInit(): void {
    this.sedeService.listar().subscribe((sedes) => this.sedes.set(sedes));
    this.especialidadService.listar().subscribe((lista) => this.especialidades.set(lista));
    this.coberturaService.listar().subscribe((lista) => this.coberturas.set(lista));
  }

  // Estas funciones se usan en el template para mostrar u ocultar campos según el rol.
  llevaSede(): boolean {
    const rol = this.formulario.controls.rol.value;
    return rol === 'operador' || rol === 'medico';
  }

  esMedico(): boolean {
    return this.formulario.controls.rol.value === 'medico';
  }

  esPaciente(): boolean {
    return this.formulario.controls.rol.value === 'paciente';
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();

    // Validaciones que dependen del rol.
    if (this.llevaSede() && !valores.id_sede) {
      this.snackBar.open('Elegí la sede del usuario', 'Cerrar', { duration: 4000 });
      return;
    }
    if (this.esMedico() && valores.especialidades.length === 0) {
      this.snackBar.open('El médico debe tener al menos una especialidad', 'Cerrar', { duration: 4000 });
      return;
    }
    if (this.esPaciente() && !valores.id_cobertura) {
      this.snackBar.open('Elegí la cobertura del paciente', 'Cerrar', { duration: 4000 });
      return;
    }

    const datos: DatosUsuario = {
      ...valores,
      id_sede: this.llevaSede() ? valores.id_sede : null,
      id_cobertura: this.esPaciente() ? valores.id_cobertura : null,
      especialidades: this.esMedico() ? valores.especialidades : [],
    };
    if (!datos.password) {
      delete datos.password;
    }

    const peticion = this.usuario
      ? this.usuarioService.actualizar(this.usuario.id, datos)
      : this.usuarioService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.snackBar.open(this.usuario ? 'Usuario modificado' : 'Usuario creado', 'Cerrar', {
          duration: 4000,
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.guardando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
