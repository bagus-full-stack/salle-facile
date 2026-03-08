import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, FinancialDashboardData } from '../../core/services/analytics.service';

@Component({
  selector: 'app-admin-finance-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord Financier</h1>
          <p class="text-gray-500">Vue d'ensemble des revenus et facturation</p>
        </div>
        <div class="flex gap-4">
          <button class="bg-[#1da1f2] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-600 transition flex items-center gap-2">
            Exporter
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64 text-gray-500">
          Chargement des données financières...
        </div>
      } @else if (dashboardData(); as data) {

        <div class="grid grid-cols-4 gap-6 mb-8">

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-400">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Chiffre d'Affaires</div>
            <div class="text-3xl font-bold text-gray-900">{{ data.kpis.totalRevenue | currency:'EUR':'symbol':'1.0-0':'fr-FR' }}</div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">En Attente</div>
            <div class="text-3xl font-bold text-gray-900">--</div> <div class="text-yellow-600 text-sm font-medium mt-2 bg-yellow-50 inline-block px-2 py-1 rounded">
            {{ data.kpis.pendingCount }} Factures à relancer
          </div>
          </div>

          <div class="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
            <div class="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex justify-between items-center">
              <span>Impayées</span>
              <span class="bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">!</span>
            </div>
            <div class="text-3xl font-bold text-gray-900">{{ data.kpis.unpaidAmount | currency:'EUR':'symbol':'1.0-0':'fr-FR' }}</div>
          </div>

        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900">Suivi des Paiements <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded ml-2 font-normal">Recent</span></h2>
          </div>

          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th class="px-6 py-4">Facture #</th>
              <th class="px-6 py-4">Client</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Montant</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (invoice of data.recentInvoices; track invoice.id) {
                <tr class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 font-bold text-gray-900">{{ invoice.id }}</td>
                  <td class="px-6 py-4 font-medium">{{ invoice.clientName }}</td>
                  <td class="px-6 py-4 text-gray-500">{{ invoice.date | date:'dd MMM yyyy':'':'fr-FR' }}</td>
                  <td class="px-6 py-4 font-bold">{{ invoice.amount | currency:'EUR' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold"
                          [ngClass]="{
                        'bg-green-100 text-green-700': invoice.status === 'COMPLETED',
                        'bg-yellow-100 text-yellow-700': invoice.status === 'PENDING',
                        'bg-red-100 text-red-700': invoice.status === 'FAILED'
                      }">
                      • {{ invoice.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    @if (invoice.status === 'FAILED' || invoice.status === 'PENDING') {
                      <button class="text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-md text-xs font-bold transition">Relancer</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminFinancePageComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  // Nos Signals pour gérer l'état
  public isLoading = signal<boolean>(true);
  public dashboardData = signal<FinancialDashboardData | null>(null);

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    this.analyticsService.getFinancialDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du dashboard', err);
        this.isLoading.set(false);
        // Gérer l'affichage de l'erreur ici (ex: toast de notification)
      }
    });
  }
}
