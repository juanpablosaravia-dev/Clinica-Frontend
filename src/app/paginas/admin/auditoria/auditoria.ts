import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { FiltrosAuditoria, RegistroAuditoria } from '../../../modelos/auditoria';
import { UsuarioCompleto } from '../../../modelos/usuario';
import { AuditoriaService } from '../../../servicios/auditoria.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Auditoría (admin): solo lectura. Filtros por usuario, entidad y rango de fechas.
// El backend devuelve los registros más recientes primero; acá se paginan.
@Component({
  selector: 'app-auditoria',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './auditoria.html',
})
export class Auditoria implements OnInit {
  private fb = inject(FormBuilder);
  private auditoriaService = inject(AuditoriaService);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  registros = signal<RegistroAuditoria[]>([]);
  usuarios = signal<UsuarioCompleto[]>([]);
  cargando = signal(false);
  pagina = signal(0);
  tamanioPagina = signal(10);

  // Entidades que registra el backend.
  entidades = ['usuario', 'sede', 'especialidad', 'cobertura'];
  columnas = ['fecha', 'usuario', 'accion', 'entidad', 'detalle'];

  filtros = this.fb.nonNullable.group({
    id_usuario: [0],
    entidad: [''],
    desde: [''],
    hasta: [''],
  });

  registrosDeLaPagina = computed(() => {
    const desde = this.pagina() * this.tamanioPagina();
    return this.registros().slice(desde, desde + this.tamanioPagina());
  });

  ngOnInit(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => {},
    });
    this.buscar();
  }

  buscar(): void {
    const valores = this.filtros.getRawValue();
    // Solo se mandan los filtros que tienen valor.
    const filtros: FiltrosAuditoria = {
      id_usuario: valores.id_usuario || undefined,
      entidad: valores.entidad || undefined,
      desde: valores.desde || undefined,
      hasta: valores.hasta || undefined,
    };

    this.cargando.set(true);
    this.auditoriaService.listar(filtros).subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.pagina.set(0);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }

  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
  }
}
