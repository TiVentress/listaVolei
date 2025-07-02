import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const isLoggedIn = await authService.isAuthenticated();
  return isLoggedIn; // está retornando boolean, que é o correto
};


