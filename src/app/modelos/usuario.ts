export type Rol = 'admin' | 'medico' | 'operador' | 'paciente';

// Datos que devuelve GET /auth/perfil.
// Los campos con "?" son opcionales: pueden venir vacíos según el rol
// (por ejemplo, el admin no tiene sede y solo el paciente tiene cobertura).
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  rol: Rol;
  id_sede: number | null;
  telefono?: string;
  fecha_nacimiento?: string;
  id_cobertura?: number | null;
  cobertura?: string | null;
  sede?: string | null;
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

// Body de PUT /auth/perfil: lo único que el paciente puede cambiar.
// La contraseña es opcional: si va vacía, no se modifica.
export interface DatosMisDatos {
  email: string;
  telefono: string;
  id_cobertura: number;
  password?: string;
}

// Un usuario tal como lo devuelve GET /usuarios (gestión de usuarios del admin).
export interface UsuarioCompleto {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  sede: string | null;
  id_cobertura: number | null;
  cobertura: string | null;
  especialidades: { id: number; descripcion: string }[];
}

// Body de POST /usuarios y PUT /usuarios/:id.
export interface DatosUsuario {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  password?: string;
  id_sede: number | null;
  id_cobertura: number | null;
  especialidades: number[];
}

// Resultado de la búsqueda de pacientes (GET /pacientes?busqueda=...).
export interface PacienteEncontrado {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  id_cobertura: number | null;
  cobertura: string | null;
}
