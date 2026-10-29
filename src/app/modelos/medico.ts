import { Especialidad } from './especialidad';

// GET /medicos: solo nombre, apellido y especialidades (sin otros datos personales).
export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: Especialidad[];
}
