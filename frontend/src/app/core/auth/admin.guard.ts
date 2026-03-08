import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  // On vérifie si l'utilisateur existe ET si son rôle fait partie des rôles administratifs
  // (Basé sur notre schéma Prisma : SUPER_ADMIN, MANAGER, STAFF)
  if (user && ['SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(user.role)) {
    return true; // Accès autorisé au Back-Office !
  }

  // S'il est connecté mais n'est qu'un simple 'USER', on le renvoie vers son espace personnel
  // S'il n'est pas connecté du tout, on le renvoie à l'accueil
  return user ? router.createUrlTree(['/mon-espace']) : router.createUrlTree(['/login']);
};
