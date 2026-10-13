import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

// Cada sección indica en "data" qué rol puede entrar.
// Si el usuario tiene otro rol, va a la página de acceso denegado.
export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.obtenerRol() === route.data['rol']) {
    return true;
  }
  return router.createUrlTree(['/acceso-denegado']);
};
