import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

// Datos que recibe el diálogo cuando se abre.
// textoBoton es opcional ("?"): si no se pasa, el botón dice "Eliminar".
export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoBoton?: string;
}

// Ventana modal de Angular Material para pedir confirmación antes de una acción
// que no se puede deshacer (eliminar, cancelar un turno).
// Es un componente reutilizable: lo usan varias pantallas.
//
// Cómo se usa desde otro componente:
//   this.dialog.open(DialogoConfirmacion, { data: { titulo, mensaje } })
//     .afterClosed()
//     .subscribe((confirmado) => { ... });
//
// Comunicación entre componentes: el que abre el diálogo le pasa datos con "data"
// (los recibe acá con MAT_DIALOG_DATA) y el diálogo le devuelve un resultado al
// cerrarse: [mat-dialog-close]="true" llega en afterClosed().
@Component({
  selector: 'app-dialogo-confirmacion',
  imports: [MatDialogModule, MatButtonModule],
  // Como el HTML es corto, lo escribimos acá mismo con "template" en vez de un archivo .html.
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>{{ datos.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Volver</button>
      <button mat-flat-button [mat-dialog-close]="true">
        {{ datos.textoBoton ?? 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DialogoConfirmacion {
  // MAT_DIALOG_DATA trae lo que se pasó en "data" al abrir el diálogo.
  datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}
