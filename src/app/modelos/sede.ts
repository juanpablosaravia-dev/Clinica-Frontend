// Una "interface" describe la forma de un objeto: qué campos tiene y de qué tipo.
// No genera código, solo sirve para que TypeScript nos avise si usamos mal los datos.
// Esta es la forma en que el backend devuelve una sede (GET /sedes).
export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

// Lo que mandamos al crear o modificar una sede: lo mismo pero sin el id
// (el id lo genera la base de datos). Omit<Tipo, 'campo'> = "Tipo sin ese campo".
export type DatosSede = Omit<Sede, 'id'>;
