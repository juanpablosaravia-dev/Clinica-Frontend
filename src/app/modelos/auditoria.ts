// Un registro de GET /auditoria.
export interface RegistroAuditoria {
  id: number;
  id_usuario: number;
  nombre_usuario: string | null;
  apellido_usuario: string | null;
  accion: 'ALTA' | 'BAJA' | 'MODIFICACION';
  entidad: string;
  id_entidad: number | null;
  detalle: string | null;
  fecha: string;
}

// Filtros opcionales de la pantalla de auditoría.
export interface FiltrosAuditoria {
  id_usuario?: number;
  entidad?: string;
  desde?: string;
  hasta?: string;
}
