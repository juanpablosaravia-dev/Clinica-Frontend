// Formato uniforme con el que responde todo el backend.
export interface RespuestaApi<T> {
  codigo: number;
  estado: string;
  datos: T;
}
