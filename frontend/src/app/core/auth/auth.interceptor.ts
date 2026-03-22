import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { catchError, throwError, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');

    // Si on a un token et que la requête va vers notre API, on l'attache
    if (token && req.url.includes('localhost:3000')) {
      console.log('[authInterceptor] Adding auth token to request:', req.url);
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // ✅ PHASE 1-3 : Gestion d'erreur 401 + retry avec refresh token
      return next(clonedReq).pipe(
        catchError(error => {
          console.error('[authInterceptor] Error detected:', error.status);

          // 🔴 DÉTECTION 401 : Token expiré ou invalide
          if (error.status === 401) {
            console.log('[authInterceptor] 401 Unauthorized - Attempting to refresh token');

            // ✅ PHASE 3 : Essayer refresh token
            return authService.refreshToken().pipe(
              switchMap(response => {
                console.log('[authInterceptor] Token refreshed, retrying request');
                // Créer nouvelle requête avec nouveau token
                const newToken = response.access_token;
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(retryReq);
              }),
              catchError(refreshError => {
                console.log('[authInterceptor] Refresh failed, logging out');
                // Refresh a échoué, logout forcé
                authService.logout();
                const message = 'Votre session a expiré. Veuillez vous reconnecter.';
                alert(message);
                return throwError(() => refreshError);
              })
            );
          }

          // Pour les autres erreurs, les laisser passer
          return throwError(() => error);
        })
      );
    }
  }

  return next(req);
};
