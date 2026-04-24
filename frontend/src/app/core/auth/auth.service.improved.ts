import { Injectable, inject, signal, PLATFORM_ID, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { throwError, Observable } from 'rxjs';

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
export interface AuthResponse { access_token: string; user: User; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:3000/auth';

  // Signals
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal(false);
  public isRefreshing = signal(false);

  // Variables privées
  private accessToken: string | null = null;
  private tokenExpireTime: number | null = null;
  private expirationCheckInterval: any;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Restaurer l'utilisateur au démarrage
      this.restoreAuthState();

      // Lancer les vérifications proactives
      this.startTokenExpirationMonitoring();

      // Listener pour logout via autre onglet
      this.setupStorageListener();

      // Effect pour arrêter monitoring si logout
      effect(() => {
        if (!this.isAuthenticated()) {
          this.clearExpirationMonitoring();
        }
      });
    }
  }

  /**
   * Restaurer l'utilisateur depuis le localStorage
   */
  private restoreAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('access_token');

    if (savedToken && savedUser) {
      this.accessToken = savedToken;

      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);

        // Décoder le token pour connaître son expiration
        const decoded = this.decodeJwt(savedToken);
        if (decoded?.exp) {
          this.tokenExpireTime = decoded.exp * 1000; // Convertir en ms
          console.log('[AuthService] Token expires at:', new Date(this.tokenExpireTime));
        }

        console.log('[AuthService] Auth state restored for user:', user.email);
      } catch (e) {
        console.error('[AuthService] Failed to restore auth state', e);
        this.logout();
      }
    }
  }

  /**
   * Login utilisateur
   */
  login(credentials: any): Observable<any> {
    console.log('[AuthService] Login attempt for:', credentials.email);
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('[AuthService] Login successful');
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        console.error('[AuthService] Login failed', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register utilisateur
   */
  register(userData: any): Observable<any> {
    console.log('[AuthService] Register attempt for:', userData.email);
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        console.log('[AuthService] Register successful');
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        console.error('[AuthService] Register failed', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Forgot Password
   */
  forgotPassword(email: string): Observable<any> {
    console.log('[AuthService] Forgot password request for:', email);
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset Password
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    console.log('[AuthService] Reset password attempt');
    return this.http.patch(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Logout utilisateur
   */
  logout(): void {
    console.log('[AuthService] Logout initiated');

    // Notifier le backend (optionnel)
    if (this.isAuthenticated() && isPlatformBrowser(this.platformId)) {
      this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
        .pipe(
          catchError(() => {
            console.warn('[AuthService] Backend logout failed, continuing with local cleanup');
            return [];
          })
        )
        .subscribe({
          complete: () => this.performLocalLogout()
        });
    } else {
      this.performLocalLogout();
    }
  }

  /**
   * Refresh token silencieusement
   */
  refreshToken(): Observable<any> {
    console.log('[AuthService] Attempting to refresh token');
    this.isRefreshing.set(true);

    return this.http.post<any>(
      `${this.apiUrl}/refresh-token`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('[AuthService] Token refreshed successfully');
        this.accessToken = response.access_token;
        this.saveToken(response.access_token);

        // Mettre à jour l'expiration
        const decoded = this.decodeJwt(response.access_token);
        if (decoded?.exp) {
          this.tokenExpireTime = decoded.exp * 1000;
          console.log('[AuthService] New token expires at:', new Date(this.tokenExpireTime));
        }

        this.isRefreshing.set(false);
      }),
      catchError(error => {
        console.error('[AuthService] Token refresh failed', error);
        this.isRefreshing.set(false);

        // Logout silencieusement si refresh échoue
        if (error.status === 401) {
          console.log('[AuthService] Refresh failed with 401, logging out');
          this.performLocalLogout();
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Gestion de succès d'authentification
   */
  private handleAuthSuccess(response: any): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('[AuthService] Handling auth success');
      this.saveToken(response.access_token);
      this.currentUser.set(response.user);
      this.isAuthenticated.set(true);

      // Décoder pour connaître l'expiration
      const decoded = this.decodeJwt(response.access_token);
      if (decoded?.exp) {
        this.tokenExpireTime = decoded.exp * 1000;
        console.log('[AuthService] Token expires at:', new Date(this.tokenExpireTime));
      }

      console.log('[AuthService] Authentication successful for', response.user.email);
    }
  }

  /**
   * Sauvegarde du token dans localStorage
   */
  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
      this.accessToken = token;
    }
  }

  /**
   * Logout local
   */
  private performLocalLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.accessToken = null;
    this.tokenExpireTime = null;
    this.clearExpirationMonitoring();

    console.log('[AuthService] Local logout complete');
    this.router.navigate(['/login'], {
      queryParams: { sessionExpired: true }
    });
  }

  /**
   * Obtenir le token d'accès actuel
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Vérifier si token expirera bientôt (< 2 minutes)
   */
  isTokenExpiringMoon(): boolean {
    if (!this.tokenExpireTime) return false;
    const timeUntilExpiry = this.tokenExpireTime - Date.now();
    return timeUntilExpiry < 120000; // Moins de 2 minutes
  }

  /**
   * Démarrer la surveillance d'expiration du token
   */
  private startTokenExpirationMonitoring(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('[AuthService] Starting token expiration monitoring');

    this.expirationCheckInterval = setInterval(() => {
      if (!this.isAuthenticated() || !this.tokenExpireTime) {
        return;
      }

      const timeUntilExpiry = this.tokenExpireTime - Date.now();

      // Debug log toutes les 30 secondes
      if (Math.round(timeUntilExpiry / 1000) % 30 === 0) {
        console.log('[AuthService] Token expires in', Math.round(timeUntilExpiry / 1000), 'seconds');
      }

      // Si expire dans 2 minutes, rafraîchir
      if (timeUntilExpiry < 120000 && timeUntilExpiry > 0 && !this.isRefreshing()) {
        console.log('[AuthService] Token expiring soon, auto-refreshing...');
        this.refreshToken().subscribe({
          error: (err) => {
            console.error('[AuthService] Auto-refresh failed', err);
          }
        });
      }

      // Si déjà expiré, logout immédiatement
      if (timeUntilExpiry <= 0 && this.isAuthenticated()) {
        console.log('[AuthService] Token already expired, logging out');
        this.performLocalLogout();
      }
    }, 10000); // Vérifier toutes les 10 secondes
  }

  /**
   * Arrêter la surveillance d'expiration
   */
  private clearExpirationMonitoring(): void {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
      this.expirationCheckInterval = null;
    }
  }

  /**
   * Setup listener pour logout via autre onglet
   */
  private setupStorageListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('storage', (event) => {
      if (event.key === 'access_token' && !event.newValue) {
        // Token supprimé par un autre onglet
        console.log('[AuthService] Token supprimé par un autre onglet, logout local');
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
        this.clearExpirationMonitoring();
      }
    });
  }

  /**
   * Décoder JWT sans dépendance externe
   */
  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      console.error('[AuthService] Failed to decode JWT', e);
      return null;
    }
  }

  loadUserFromToken(token: string) {
    this.handleAuthentication(token);
  }

  private handleAuthentication(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }

    const decodedUser = this.decodeJwt(token);

    if (decodedUser) {
      const user: User = {
        id: decodedUser.sub || decodedUser.id,
        firstName: decodedUser.firstName,
        lastName: decodedUser.lastName,
        email: decodedUser.email,
        role: decodedUser.role as UserRole
      };

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  private checkInitialAuth() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decodedUser = this.decodeJwt(token);
        if (decodedUser) {
          this.currentUser.set(decodedUser);
        } else {
          this.logout();
        }
      }
    }
  }
}

