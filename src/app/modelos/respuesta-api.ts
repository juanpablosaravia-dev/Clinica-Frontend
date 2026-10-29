// Formato uniforme con el que responde todo el backend: { codigo, estado, datos }.
// <T> es un "genérico": representa el tipo de "datos", que cambia según el endpoint.
// Por ejemplo, RespuestaApi<Sede[]> es una respuesta cuyo "datos" es una lista de sedes.
// En los errores, el mensaje para el usuario viene en "estado" (ver utilidades/mensaje-error.ts).
export interface RespuestaApi<T> {
  codigo: number;
  estado: string;
  datos: T;
}
