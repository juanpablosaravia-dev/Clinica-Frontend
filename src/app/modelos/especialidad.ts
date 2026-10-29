// Forma en que el backend devuelve una especialidad (GET /especialidades).
export interface Especialidad {
  id: number;
  descripcion: string;
}

// Lo que mandamos al crear o modificar: todo menos el id.
export type DatosEspecialidad = Omit<Especialidad, 'id'>;
