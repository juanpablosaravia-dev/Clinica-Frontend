export interface Cobertura {
  id: number;
  nombre: string;
}

// Lo que mandamos al crear o modificar: todo menos el id.
export type DatosCobertura = Omit<Cobertura, 'id'>;
