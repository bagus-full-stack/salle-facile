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

export interface GeneralDashboardData {
  summary: {
    reservations: { value: number, variation: number },
    revenue: { value: number, variation: number },
    newUsers: { value: number, variation: number },
    rooms: { active: number, total: number }
  };
  charts: {
    labels: string[];
    revenues: number[];
    occupancy: number[];
  };
  radar: {
    labels: string[];
    data: number[];
  };
  detailedKpis: {
    thisMonth: { reservations: number, revenue: number, occupancy: number, popularSlot: string };
    lastMonth: { reservations: number, revenue: number, occupancy: number, popularSlot: string };
    variations: { reservations: string, revenue: string, occupancy: number };
  };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin/analytics';

  getFinancialDashboard(): Observable<FinancialDashboardData> {
    return this.http.get<FinancialDashboardData>(`${this.apiUrl}/dashboard`);
  }

  getGeneralDashboard(): Observable<GeneralDashboardData> {
    return this.http.get<GeneralDashboardData>(`${this.apiUrl}/general`);
  }
}
