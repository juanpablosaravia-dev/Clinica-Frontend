# Clínica — Frontend

Frontend del TP Integrador hecho con Angular 21 y Angular Material 21. Consume la API del
repositorio [Clinica-Backend](https://github.com/juanpablosaravia-dev/Clinica-Backend).

## Versiones utilizadas

| Herramienta | Versión |
|---|---|
| Node.js | 22.20.0 (sirve cualquier `^20.19`, `^22.12` o `^24`) |
| Angular CLI | 21.2.26 |
| Angular | 21.2.x |
| Angular Material | 21.2.14 |
| TypeScript | 5.9.x |
| pnpm | 11.1.2 |
| MySQL / MariaDB | 8.x / 10.x |
| Librería de gráficos | **Chart.js 4.6** (usada directamente, sin wrapper, en la pantalla de Reportes) |

## Cómo levantar el sistema completo desde cero

### 1. Base de datos

1. Crear una base vacía llamada `clinica` (desde phpMyAdmin, MySQL Workbench o la consola):
   ```sql
   CREATE DATABASE clinica CHARACTER SET utf8 COLLATE utf8_general_ci;
   ```
2. Importar en esa base el script `sql/ScriptSQL.sql` del repositorio del backend
   (en la consola: `mysql -u root -p clinica < sql/ScriptSQL.sql`).

### 2. Backend (`Clinica-Backend`)

```bash
pnpm install
cp .env.example .env      # completar las variables (ver abajo)
pnpm seed:usuarios        # contraseñas reales para admin, médico y operador
pnpm seed:demo            # datos de prueba: médicos, agenda y turnos
pnpm dev                  # queda en http://localhost:3000
```

Variables de entorno del backend (`.env`):

| Variable | Ejemplo | Para qué |
|---|---|---|
| `PORT` | `3000` | Puerto de la API |
| `JWT_SECRET` | `un_secreto_largo` | Firma de los tokens |
| `JWT_EXPIRES_IN` | `2h` | Vigencia del token |
| `DB_HOST` | `localhost` | Servidor MySQL |
| `DB_USER` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | *(vacío)* | Contraseña de MySQL |
| `DB_NAME` | `clinica` | Nombre de la base |

`pnpm seed:demo` calcula las fechas a partir del día en que se corre (ayer, hoy y los próximos
días), así siempre hay agenda y turnos para probar.

### 3. Frontend (`Clinica-Frontend`)

```bash
pnpm install
pnpm start        # equivale a ng serve
```

Abrir `http://localhost:4200`. La URL del backend se define en un único lugar:
`src/environments/environment.ts`. Para compilar: `pnpm build` (equivale a `ng build`).

> Con npm también funciona: `npm install` y `npx ng serve`.

## Usuarios de prueba

El login se hace con **DNI y contraseña**.

| Rol | Nombre | DNI | Contraseña | Datos |
|---|---|---|---|---|
| admin | Marcos Gomez | `18222333` | `Admin123!` | Sin sede |
| operador | Juan Perez | `15200548` | `Operador123!` | Sede Centro |
| médico | Ana Lopez | `20111222` | `Medico123!` | Traumatología. Atiende en **Sede Centro y Sede Norte** |
| médico | Carlos Ruiz | `30111222` | `Medico123!` | Cardiología, Sede Norte |
| médico | Laura Diaz | `31222333` | `Medico123!` | Pediatría, Sede Centro |
| paciente | Sofia Martinez | `35111222` | `Paciente123!` | Turnos confirmados, uno cancelado y uno atendido con historial |

Los médicos Carlos y Laura y la paciente Sofía los crea `pnpm seed:demo`. También se puede
registrar un paciente nuevo desde "Crear cuenta".

## Qué puede hacer cada rol

| Rol | Pantallas |
|---|---|
| Paciente | Nuevo turno (paso a paso), Mis turnos (detalle, cancelar, historial), Mis datos personales |
| Médico | Mi agenda (rangos en una o más sedes), Turnos programados (atender y cancelar), Historial clínico |
| Operador | Agenda y turnos de su sede (nueva agenda, editar, ver y cancelar turnos), Alta de paciente, Asignar turno |
| Admin | Sedes, Especialidades, Coberturas, Usuarios, Auditoría, Reportes |
| Todos | Mi perfil y notificaciones (campana del header) |

## Estructura

```
src/
├── environments/environment.ts   URL base de la API (único lugar)
└── app/
    ├── modelos/        interfaces de los datos que devuelve la API
    ├── servicios/      un servicio por recurso (auth, sede, agenda, turno, notificacion...)
    ├── interceptores/  tokenInterceptor: agrega el token y lleva al login si vence
    ├── guards/         sesionGuard (pide sesión) y rolGuard (pide el rol de la sección)
    ├── utilidades/     mensaje de error, fechas, paginador en español
    ├── componentes/    layout (header, menu, footer) y componentes REUTILIZABLES:
    │     formulario-paciente   registro público y alta de paciente del operador
    │     solicitud-turno       "Nuevo turno" del paciente y "Asignar turno" del operador
    │     gestor-agenda         "Mi agenda" del médico y edición de agenda del operador
    │     buscador-paciente     historial del médico y asignar turno del operador
    │     dialogo-*             confirmación, rango de agenda, atender turno, usuario
    ├── paginas/        una carpeta por rol (paciente, medico, operador, admin) + públicas
    └── app.routes.ts   rutas públicas, /perfil y una sección por rol
```

## Conceptos de Angular usados (para la defensa)

Cada archivo está comentado. Estos son los conceptos y dónde verlos:

| Concepto | Qué es | Dónde verlo |
|---|---|---|
| Componente standalone | Clase + template + `imports` de lo que usa | Cualquier archivo de `paginas/` |
| Interpolación `{{ }}` | Muestra un valor en el HTML | Todos los templates |
| Property binding `[prop]` | Pasa un valor a una propiedad | `[dataSource]`, `[disabled]`, `[matBadge]` en `header.html` |
| Event binding `(evento)` | Ejecuta un método ante un evento | `(click)`, `(ngSubmit)`, `(selectionChange)` |
| Two-way binding `[(ngModel)]` | El input y la variable se sincronizan | `buscador-paciente.ts` |
| `@if`, `@for`, `@empty` | Control de flujo en el template | `mis-turnos.html`, `header.html` |
| Signals: `signal`, `computed`, `effect` | Estado reactivo: el HTML se actualiza solo | `sedes.ts` (filtro con `computed`), `gestor-agenda.ts` (`effect`) |
| `input()` | Dato que entra del padre al hijo | `solicitud-turno.ts` (`idPaciente`, `sedeFija`) |
| `output()` | Evento que sale del hijo al padre | `formulario-paciente.ts` (`registrado`), `header.ts` (`alternarMenu`) |
| `<ng-content>` | El padre mete contenido dentro del hijo | `formulario-paciente.html` + `registro.ts` |
| Servicio compartido | Comunicación entre componentes no relacionados | `notificacion.service.ts` (header + pantallas de turnos) |
| Diálogos con datos | Pasar datos al abrir y recibir un resultado al cerrar | `dialogo-confirmacion.ts`, `dialogo-agenda.ts` |
| Inyección de dependencias | `inject(Servicio)` | Todos los componentes |
| Formularios reactivos | `FormBuilder`, `Validators`, validador propio | `dialogo-agenda.ts` (salida > entrada), `mis-datos.ts` (contraseñas iguales) |
| Observables y RxJS | `subscribe`, `map`, `tap`, `forkJoin` | `reporte.service.ts` (`forkJoin`), `turno.service.ts` (`tap`) |
| Interceptor HTTP | Código que corre en todas las peticiones | `token.interceptor.ts` |
| Guards | Protegen rutas | `sesion.guard.ts`, `rol.guard.ts` |
| Pipes | Transforman valores en el template | `date`, `percent`, `titlecase` |
| `viewChild` | Referencia a un elemento del template | `reportes.ts` (canvas de Chart.js), `solicitud-turno.ts` (stepper) |

## Cómo funciona la sesión

- **Login**: `POST /auth/login` devuelve el token, que se guarda en `localStorage`. Después se
  pide `GET /auth/perfil` y el usuario también se guarda. Por eso al recargar la sesión se mantiene.
- **Peticiones protegidas**: el `tokenInterceptor` agrega el token a cada petición. Si el backend
  responde `401` (token vencido o inválido) se cierra la sesión y se va al login.
- **Cerrar sesión**: borra el token y el usuario y vuelve a la pantalla principal.

## Notificaciones

El `NotificacionService` guarda las notificaciones en un signal y calcula las no leídas con
`computed`. El header las muestra en la campana. Se recargan:
- al navegar a cualquier pantalla (así se ven las que generó otro usuario),
- después de confirmar, cancelar o atender un turno (sin recargar la página),
- y al marcar una como leída el contador baja al instante.

## Manejo de errores

- Los errores del backend (`estado` de la respuesta) se muestran en un aviso (snackbar).
- Si el backend no responde, se muestra "No se pudo conectar con el servidor" y la pantalla no
  queda colgada ni en blanco.
- Mientras se espera una respuesta se muestra una barra de carga, y los listados vacíos muestran
  un mensaje en lugar de una tabla vacía.
- Las fechas se muestran en formato local (`dd/MM/yyyy`) con el idioma `es-AR`.

## Rutas y roles

| Ruta | Acceso |
|---|---|
| `/`, `/login`, `/registro` | Público |
| `/perfil` | Cualquier usuario logueado |
| `/paciente/...`, `/medico/...`, `/operador/...`, `/admin/...` | Solo el rol de la sección |
| Cualquier otra | Página "No encontrada" |

Sin sesión, una ruta protegida redirige a `/login`. Con un rol distinto redirige a
`/acceso-denegado`, aunque se escriba la URL a mano.

## Cambios hechos en el backend para el frontend

Están documentados en la carpeta **"Frontend - endpoints nuevos y ampliados"** de la colección
de Postman y en el README del backend. Resumen:

- Nuevos: `GET /medicos`, `GET /disponibilidad/fechas`, `GET /disponibilidad/horarios`,
  `GET /pacientes`, `PUT /auth/perfil`, `GET/POST/PUT /usuarios`.
- `GET /sedes` y `GET /especialidades` abiertos a cualquier usuario con sesión.
- Agenda: nombres en el listado, el operador solo opera en su sede, no se puede borrar un rango
  con turnos confirmados ni modificarlo dejando turnos afuera.
- Turnos de 30 minutos; el médico opera sobre sus turnos en cualquier sede; los listados traen
  nombres, edad del paciente y el historial si fue atendido.

## Diseño

La idea visual es la **señalética de un hospital**: cada rol es un "sector" con su color, como los
carteles de los pasillos. Debajo del header aparece una franja con el color del sector del usuario
logueado, y en el menú la opción actual se marca con una placa amarilla. Tipografía
**Atkinson Hyperlegible Next**. Todos los componentes son de Angular Material. La app está pensada
para PC de escritorio.
