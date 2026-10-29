import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogoUsuario } from '../../../componentes/dialogo-usuario/dialogo-usuario';
import { Sede } from '../../../modelos/sede';
import { UsuarioCompleto } from '../../../modelos/usuario';
import { SedeService } from '../../../servicios/sede.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Gestión de usuarios (admin): listado paginado con filtros por nombre, apellido,
// tipo de usuario y sede. Alta y edición en un diálogo.
@Component({
  selector: 'app-usuarios',
  imports: [
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private sedeService = inject(SedeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  usuarios = signal<UsuarioCompleto[]>([]);
  sedes = signal<Sede[]>([]);
  cargando = signal(false);

  // Filtros (cada uno es un signal; '' o 0 = sin filtro)
  filtroNombre = signal('');
  filtroApellido = signal('');
  filtroRol = signal('');
  filtroSede = signal(0);

  // Paginación
  pagina = signal(0);
  tamanioPagina = signal(10);

  columnas = ['apellido', 'nombre', 'dni', 'rol', 'sede', 'acciones'];

  // Primero se filtra...
  usuariosFiltrados = computed(() => {
    const nombre = this.filtroNombre().trim().toLowerCase();
    const apellido = this.filtroApellido().trim().toLowerCase();
    return this.usuarios().filter(
      (u) =>
        u.nombre.toLowerCase().includes(nombre) &&
        u.apellido.toLowerCase().includes(apellido) &&
        (this.filtroRol() === '' || u.rol === this.filtroRol()) &&
        (this.filtroSede() === 0 || u.id_sede === this.filtroSede()),
    );
  });

  // ...y después se corta la página que toca mostrar.
  usuariosDeLaPagina = computed(() => {
    const desde = this.pagina() * this.tamanioPagina();
    return this.usuariosFiltrados().slice(desde, desde + this.tamanioPagina());
  });

  ngOnInit(): void {
    this.sedeService.listar().subscribe((sedes) => this.sedes.set(sedes));
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }

  // El paginador emite (page) con la página y el tamaño elegidos.
  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
  }

  // Sin usuario = alta; con usuario = edición.
  abrirFormulario(usuario: UsuarioCompleto | null): void {
    this.dialog
      .open(DialogoUsuario, { data: usuario, width: '560px' })
      .afterClosed()
      .subscribe((huboCambios) => {
        if (huboCambios) {
          this.cargarUsuarios();
        }
      });
  }
}
