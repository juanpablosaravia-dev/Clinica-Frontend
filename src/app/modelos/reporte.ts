// Respuestas de los cuatro endpoints de /reportes.
export interface TurnosPorEspecialidad {
  id_especialidad: number;
  descripcion: string;
  cantidad: number;
}

export interface TurnosPorSede {
  id_sede: number;
  nombre: string;
  cantidad: number;
}

export interface RankingMedico {
  id_medico: number;
  nombre: string;
  apellido: string;
  turnos_atendidos: number;
}

export interface TasaCancelacion {
  total: number;
  cancelados: number;
  tasa: number; // entre 0 y 1
}

// Los cuatro indicadores juntos, para cargarlos de una sola vez.
export interface Reportes {
  porEspecialidad: TurnosPorEspecialidad[];
  porSede: TurnosPorSede[];
  ranking: RankingMedico[];
  cancelacion: TasaCancelacion;
}
