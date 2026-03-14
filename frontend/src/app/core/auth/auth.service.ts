import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

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

  public currentUser = signal<User | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    this.currentUser.set(response.user);
  }

  loadUserFromToken(token: string) {
    this.handleAuthentication(token);
  }

  private handleAuthentication(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      // 1. On sauvegarde le token dans le navigateur
      localStorage.setItem('access_token', token);
    }

    // 2. On décode le token pour lire les infos (sans librairie externe)
    const decodedUser = this.decodeJwt(token);

    // 3. On met à jour le Signal pour débloquer l'interface
    if (decodedUser) {
      // Adapter le format du JWT vers notre interface User
      // Le payload JWT standard utilise 'sub' pour l'ID
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
    }
  }

  private checkInitialAuth() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Si le token expire, on pourrait le vérifier ici,
        // pour faire simple on le décode juste.
        const decodedUser = this.decodeJwt(token);
        if (decodedUser) {
          this.currentUser.set(decodedUser);
        } else {
          this.logout();
        }
      }
    }
  }

  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      // atob() décode le base64 natif du navigateur
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }
}
