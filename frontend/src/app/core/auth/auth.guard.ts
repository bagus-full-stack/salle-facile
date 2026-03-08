import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Notre AuthService charge l'utilisateur depuis le localStorage au démarrage
  // Si le signal currentUser() contient des données, l'utilisateur est connecté.
  if (authService.currentUser()) {
    return true; // Accès autorisé !
  }

  // S'il n'est pas connecté, on le redirige vers la page de connexion
  // en lui passant l'URL qu'il essayait d'atteindre pour le rediriger après (optionnel mais UX friendly)
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
