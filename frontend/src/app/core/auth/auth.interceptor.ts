import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import {
  catchError,
  throwError,
  switchMap,
  finalize,
  timeout
} from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = authService.getAccessToken();

  // 1️⃣ Attacher le token à chaque requête vers l'API interne
  if (token && isApiRequest(req)) {
    console.log('[authInterceptor] Attaching token to request:', req.url);

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2️⃣ Gérer les erreurs HTTP
  return next(req).pipe(
    timeout(30000), // Timeout de 30 secondes
    catchError((error: HttpErrorResponse) => {
      console.error('[authInterceptor] HTTP Error detected:', {
        status: error.status,
        url: error.url,
        message: error.message
      });

      // Ignorer les erreurs non-401
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Ignorer les requêtes vers les routes d'auth
      if (isAuthRoute(req.url)) {
        console.log('[authInterceptor] 401 on auth route, skipping refresh');
        return throwError(() => error);
      }

      console.log('[authInterceptor] 401 Unauthorized detected, attempting silent refresh');

      // ❌ Un refresh est déjà en cours → éviter de relancer
      if (isRefreshing) {
        console.log('[authInterceptor] Refresh already in progress, queuing request');
        return throwError(() => new Error('Refresh in progress'));
      }

      // ✅ Lancer le refresh token
      isRefreshing = true;

      return authService.refreshToken().pipe(
        switchMap(response => {
          console.log('[authInterceptor] Token refreshed successfully, retrying request');

          const newToken = response.access_token;
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });

          return next(retryReq);
        }),
        catchError(refreshError => {
          console.error('[authInterceptor] Token refresh failed:', refreshError);
          // authService.logout() est appelé dans le service lui-même
          return throwError(() => refreshError);
        }),
        finalize(() => {
          isRefreshing = false;
          console.log('[authInterceptor] Refresh cycle completed');
        })
      );
    })
  );
};

/**
 * Vérifier si la requête va vers l'API interne
 */
function isApiRequest(req: any): boolean {
  return req.url.includes('localhost:3000') ||
         req.url.includes('127.0.0.1:3000') ||
         req.url.includes('api.sallefacile.com');
}

/**
 * Vérifier si la requête va vers une route d'authentification (no-retry routes)
 */
function isAuthRoute(url: string): boolean {
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/google',
    '/auth/linkedin'
  ];

  return authPaths.some(path => url.includes(path));
}
