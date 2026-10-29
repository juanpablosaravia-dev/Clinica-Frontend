import { HttpErrorResponse } from '@angular/common/http';

// Convierte un error HTTP en un texto para mostrarle al usuario.
// - Si el backend está apagado no hay respuesta y Angular pone status = 0.
// - Si el backend respondió, el mensaje viene en "estado" (formato { codigo, estado, datos }).
//   Ejemplo: "No se puede eliminar la sede: tiene agenda asociada".
export function obtenerMensajeError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor';
  }
  return error.error?.estado ?? 'Ocurrió un error inesperado';
}
