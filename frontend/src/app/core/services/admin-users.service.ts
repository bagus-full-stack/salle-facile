import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from '../auth/auth.service';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'INDIVIDUAL' | 'PROFESSIONAL';
  companyName: string | null;
  siret: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  _count: { reservations: number };
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountType: 'INDIVIDUAL' | 'PROFESSIONAL';
  companyName?: string;
  siret?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin/users';

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.apiUrl);
  }

  createUser(dto: CreateUserDto): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.apiUrl, dto);
  }

  updateUser(userId: string, data: Partial<CreateUserDto>): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/${userId}`, data);
  }

  updateRole(userId: string, newRole: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/role`, { role: newRole });
  }

  toggleStatus(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
