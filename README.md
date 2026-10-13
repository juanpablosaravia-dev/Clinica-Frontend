# Clínica — Frontend

Frontend del TP Integrador hecho con Angular 21 y Angular Material 21. Consume la API del
repositorio [Clinica-Backend](https://github.com/juanpablosaravia-dev/Clinica-Backend).

## Versiones utilizadas

| Herramienta | Versión |
|---|---|
| Node.js | 22.18.0 (sirve cualquier `^20.19`, `^22.12` o `^24`) |
| Angular CLI | 21.2.x |
| Angular | 21.2.x |
| Angular Material | 21.2.x |
| TypeScript | 5.9.x |
| pnpm | 11.x |

## Cómo levantarlo

1. Levantar el backend (con MySQL andando) en `http://localhost:3000`. Ver el README del backend;
   el backend ya tiene CORS habilitado.
2. Instalar dependencias y levantar el front:

```bash
pnpm install
pnpm start        # equivale a ng serve
```

3. Abrir `http://localhost:4200`.

La URL del backend se define en un único lugar: `src/environments/environment.ts`.

## Usuarios de prueba

El login se hace con **DNI y contraseña**. Además de los pacientes que se registren desde la
pantalla de registro, el backend trae (después de correr `pnpm seed:usuarios` allá):

| Rol | DNI | Contraseña |
|---|---|---|
| admin | `18222333` | `Admin123!` |
| medico | `20111222` | `Medico123!` |
| operador | `15200548` | `Operador123!` |

## Estructura

```
src/
├── environments/environment.ts   URL base de la API
└── app/
    ├── modelos/        interfaces: RespuestaApi, Usuario, Cobertura
    ├── servicios/      AuthService (registro, login, sesión) y CoberturaService
    ├── interceptores/  tokenInterceptor: agrega "Authorization: Bearer <token>"
    ├── guards/         sesionGuard (pide sesión) y rolGuard (pide el rol de la sección)
    ├── componentes/    header, menu y footer (layout)
    ├── paginas/        inicio, login, registro, perfil, en-construccion,
    │                   acceso-denegado y no-encontrada
    └── app.routes.ts   rutas públicas, /perfil y una sección por rol
```

## Cómo funciona la sesión

- **Login**: `POST /auth/login` devuelve el token, que se guarda en `localStorage`. Después se
  pide `GET /auth/perfil` y el usuario (nombre, rol) también se guarda en `localStorage`. Por eso
  al recargar la página la sesión se mantiene.
- **Peticiones protegidas**: el `tokenInterceptor` agrega el token a cada petición. Si el backend
  responde `401` (token vencido o inválido) se cierra la sesión y se va al login.
- **Cerrar sesión**: borra el token y el usuario y vuelve a la pantalla principal.

## Rutas y roles

| Ruta | Acceso |
|---|---|
| `/`, `/login`, `/registro` | Público |
| `/perfil` | Cualquier usuario logueado |
| `/paciente/...`, `/medico/...`, `/operador/...`, `/admin/...` | Solo el rol de la sección |
| Cualquier otra | Página "No encontrada" |

Sin sesión, una ruta protegida redirige a `/login`. Con un rol distinto redirige a
`/acceso-denegado`. Las opciones de semanas futuras muestran "En construcción".
