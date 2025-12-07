import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const expirationStr = localStorage.getItem('token_expiration');

  // 1) Si no hay token => a login
  if (!token) {
    return router.parseUrl('/login');
  }

  // 2) Si hay expiración y está en el pasado => limpiar y a login
  if (expirationStr) {
    const expiration = new Date(expirationStr);
    const now = new Date();

    if (expiration <= now) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiration');
      return router.parseUrl('/login');
    }
  }

  // 3) Todo ok
  return true;
};
