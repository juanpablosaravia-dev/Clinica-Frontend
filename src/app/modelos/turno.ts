// Un "union type": el estado solo puede tomar uno de estos tres valores.
export type EstadoTurno = 'confirmado' | 'cancelado' | 'atendido';

// Un turno tal como lo devuelven los listados (mis turnos, programados y de la sede).
// Si el turno fue atendido, trae también el resumen del historial clínico.
export interface Turno {
  id: number;
  fecha: string;
  hora: string;
  nota: string;
  estado: EstadoTurno;
  id_paciente: number;
  id_medico: number;
  id_sede: number;
  id_especialidad: number;
  nombre_paciente: string;
  apellido_paciente: string;
  fecha_nacimiento_paciente: string;
  nombre_medico: string;
  apellido_medico: string;
  especialidad: string;
  sede: string;
  cobertura: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
}

// Body de POST /turnos. id_paciente solo lo manda el operador.
export interface DatosTurno {
  id_especialidad: number;
  id_sede: number;
  id_medico: number;
  fecha: string;
  hora: string;
  nota: string;
  id_paciente?: number;
}

// Body de PATCH /turnos/:id/atender (historial clínico del turno).
export interface DatosAtencion {
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}

// Registro del historial clínico (GET /historial/paciente/:id).
export interface RegistroHistorial {
  id: number;
  id_turno: number;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  fecha_registro: string;
}
