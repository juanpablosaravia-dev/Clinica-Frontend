// GET /notificaciones. "leida" viene como 0 o 1 desde la base.
export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: number;
  fecha: string;
}
