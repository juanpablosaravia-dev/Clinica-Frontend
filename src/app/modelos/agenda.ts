// Un rango horario de la agenda de un médico (GET /agenda).
// Además de los ids, el backend manda los nombres para mostrarlos directamente.
export interface Agenda {
  id: number;
  fecha: string; // AAAA-MM-DD
  hora_entrada: string; // HH:MM
  hora_salida: string; // HH:MM
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
  nombre_medico: string;
  apellido_medico: string;
  especialidad: string;
  sede: string;
}

// Body de POST /agenda y PUT /agenda/:id.
export interface DatosAgenda {
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}
