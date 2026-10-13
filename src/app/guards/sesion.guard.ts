import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

// Sin sesión no se puede entrar a rutas protegidas: se redirige al login.
export const sesionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
