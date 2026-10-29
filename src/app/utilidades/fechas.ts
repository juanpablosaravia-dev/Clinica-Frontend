// Fecha de hoy en formato AAAA-MM-DD (el que usan el backend y los <input type="date">).
export function fechaDeHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Edad en años a partir de la fecha de nacimiento (AAAA-MM-DD).
export function calcularEdad(fechaNacimiento: string): number {
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  // Si todavía no cumplió años este año, se resta uno.
  const yaCumplio =
    hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);
  if (!yaCumplio) {
    edad--;
  }
  return edad;
}
