import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User { id: string; firstName: string; lastName: string; email: string; role: string; }
export interface AuthResponse { access_token: string; user: User; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/auth';

  // Signal réactif contenant l'utilisateur actuel
  public currentUser = signal<User | null>(null);

  constructor() {
    // Au démarrage, on vérifie s'il y a un utilisateur sauvegardé
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(userData: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }
}
