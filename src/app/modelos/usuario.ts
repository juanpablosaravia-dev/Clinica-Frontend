export type Rol = 'admin' | 'medico' | 'operador' | 'paciente';

// Datos que devuelve GET /auth/perfil.
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  rol: Rol;
  id_sede: number | null;
}

// Body de POST /auth/registro.
export interface DatosRegistro {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  id_cobertura: number;
}
