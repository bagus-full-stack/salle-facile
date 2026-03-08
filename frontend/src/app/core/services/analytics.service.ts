import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FinancialDashboardData {
  kpis: {
    totalRevenue: number;
    unpaidAmount: number;
    pendingCount: number;
  };
  recentInvoices: {
    id: string;
    clientName: string;
    date: string;
    amount: number;
    status: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin/analytics';

  getFinancialDashboard(): Observable<FinancialDashboardData> {
    return this.http.get<FinancialDashboardData>(`${this.apiUrl}/dashboard`);
  }
}
