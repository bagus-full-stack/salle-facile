import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'INDIVIDUAL' | 'PROFESSIONAL';
  companyName: string | null;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'USER';
  isActive: boolean;
  createdAt: string;
  _count: { reservations: number };
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin/users';

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.apiUrl);
  }

  updateRole(userId: string, newRole: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/role`, { role: newRole });
  }

  toggleStatus(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/toggle-status`, {});
  }
}
