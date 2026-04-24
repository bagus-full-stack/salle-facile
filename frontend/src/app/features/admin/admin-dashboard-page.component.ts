import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AnalyticsService, GeneralDashboardData } from '../../core/services/analytics.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 font-sans">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1da1f2]"></div>
        </div>
      } @else if (data(); as dashboard) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Stat Card 1 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Réservations (ce mois)</div>
            <div class="text-3xl font-extrabold text-gray-900">{{ dashboard.summary.reservations.value }}</div>
            <div [class]="dashboard.summary.reservations.variation >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-semibold mt-1">
              {{ dashboard.summary.reservations.variation >= 0 ? '↑' : '↓' }} {{ dashboard.summary.reservations.variation > 0 ? '+' : '' }}{{ dashboard.summary.reservations.variation }}%
            </div>
          </div>

          <!-- Stat Card 2 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Revenus (ce mois)</div>
            <div class="text-3xl font-extrabold text-gray-900">{{ dashboard.summary.revenue.value | number:'1.0-0' }} €</div>
            <div [class]="dashboard.summary.revenue.variation >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-semibold mt-1">
              {{ dashboard.summary.revenue.variation >= 0 ? '↑' : '↓' }} {{ dashboard.summary.revenue.variation > 0 ? '+' : '' }}{{ dashboard.summary.revenue.variation }}%
            </div>
          </div>

          <!-- Stat Card 3 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Nouveaux clients</div>
            <div class="text-3xl font-extrabold text-gray-900">{{ dashboard.summary.newUsers.value }}</div>
            <div [class]="dashboard.summary.newUsers.variation >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-semibold mt-1">
               {{ dashboard.summary.newUsers.variation >= 0 ? '↑' : '↓' }} {{ dashboard.summary.newUsers.variation > 0 ? '+' : '' }}{{ dashboard.summary.newUsers.variation }}%
            </div>
          </div>

          <!-- Stat Card 4 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Salles actives</div>
            <div class="text-3xl font-extrabold text-gray-900">{{ dashboard.summary.rooms.active }}/{{ dashboard.summary.rooms.total }}</div>
            <div class="text-gray-400 text-sm font-semibold mt-1">{{ dashboard.summary.rooms.total - dashboard.summary.rooms.active }} en maintenance</div>
          </div>
        </div>

        <!-- Nouveaux Graphiques & KPIs -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Card Revenus -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Revenus Mensuels</h3>
                <p class="text-sm text-[#27b5c8]">Revenu total (€) par mois</p>
              </div>
            </div>
            <div class="flex-grow mt-6 w-full h-[250px] relative">
              <canvas #revenueChart></canvas>
            </div>
          </div>

          <!-- Card Taux d'Occupation -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Taux d'Occupation</h3>
                <p class="text-sm text-[#27b5c8]">Occupation en % (Toutes les salles)</p>
              </div>
              <span class="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded"> Global </span>
            </div>
            <div class="flex-grow mt-6 w-full h-[250px] relative">
              <canvas #occupancyChart></canvas>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Analyse Multicritères -->
          <div class="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 w-full text-left mb-2">Analyse Globale</h3>
            <div class="w-full relative h-[300px] flex justify-center items-center flex-grow">
              <canvas #radarChart></canvas>
            </div>
            <div class="flex gap-6 mt-4 text-sm text-gray-500 font-medium">
              <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#1da1f2]"></span> Toutes les salles</div>
            </div>
          </div>

          <!-- Détails des KPIs -->
          <div class="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Évolution des KPIs (Ce mois vs Précédent)</h3>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="text-[#27b5c8] uppercase tracking-wider font-semibold text-xs border-b border-gray-100">
                    <th class="pb-4 pt-2">INDICATEUR</th>
                    <th class="pb-4 pt-2">CE MOIS</th>
                    <th class="pb-4 pt-2 text-gray-400">MOIS PRÉCÉDENT</th>
                    <th class="pb-4 pt-2 text-right">ÉVOLUTION</th>
                  </tr>
                </thead>
                <tbody class="text-gray-800">
                  <tr class="border-b border-gray-50/70 hover:bg-gray-50/50 transition-colors">
                    <td class="py-5 flex items-center gap-3">
                      <span class="text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </span>
                      <span class="font-medium text-gray-700">Total Réservations</span>
                    </td>
                    <td class="py-5 font-bold">{{ dashboard.detailedKpis.thisMonth.reservations }}</td>
                    <td class="py-5 text-gray-500 font-medium">{{ dashboard.detailedKpis.lastMonth.reservations }}</td>
                    <td class="py-5 text-right">
                      <span [class]="dashboard.detailedKpis.thisMonth.reservations >= dashboard.detailedKpis.lastMonth.reservations ? 'bg-green-50/60 text-[#10b981]' : 'bg-red-50/50 text-red-500'" class="font-bold px-2.5 py-1 rounded text-xs">
                        {{ dashboard.detailedKpis.thisMonth.reservations >= dashboard.detailedKpis.lastMonth.reservations ? '+' : '' }}{{ dashboard.detailedKpis.variations.reservations }}%
                      </span>
                    </td>
                  </tr>
                  <tr class="border-b border-gray-50/70 hover:bg-gray-50/50 transition-colors">
                     <td class="py-5 flex items-center gap-3">
                      <span class="text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </span>
                      <span class="font-medium text-gray-700">Revenu Total</span>
                    </td>
                    <td class="py-5 font-bold">{{ dashboard.detailedKpis.thisMonth.revenue | number:'1.0-0' }} €</td>
                    <td class="py-5 text-gray-500 font-medium">{{ dashboard.detailedKpis.lastMonth.revenue | number:'1.0-0' }} €</td>
                    <td class="py-5 text-right">
                      <span [class]="dashboard.detailedKpis.thisMonth.revenue >= dashboard.detailedKpis.lastMonth.revenue ? 'bg-green-50/60 text-[#10b981]' : 'bg-red-50/50 text-red-500'" class="font-bold px-2.5 py-1 rounded text-xs">
                        {{ dashboard.detailedKpis.thisMonth.revenue >= dashboard.detailedKpis.lastMonth.revenue ? '+' : '' }}{{ dashboard.detailedKpis.variations.revenue }}%
                      </span>
                    </td>
                  </tr>
                  <tr class="border-b border-gray-50/70 hover:bg-gray-50/50 transition-colors">
                     <td class="py-5 flex items-center gap-3">
                       <span class="text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      </span>
                      <span class="font-medium text-gray-700">Taux d'Occupation</span>
                    </td>
                    <td class="py-5 font-bold">{{ dashboard.detailedKpis.thisMonth.occupancy }}%</td>
                    <td class="py-5 text-gray-500 font-medium">{{ dashboard.detailedKpis.lastMonth.occupancy }}%</td>
                    <td class="py-5 text-right">
                      <span [class]="dashboard.detailedKpis.variations.occupancy >= 0 ? 'bg-green-50/60 text-[#10b981]' : 'bg-red-50/50 text-red-500'" class="font-bold px-2.5 py-1 rounded text-xs">
                        {{ dashboard.detailedKpis.variations.occupancy >= 0 ? '+' : '' }}{{ dashboard.detailedKpis.variations.occupancy }} pts
                      </span>
                    </td>
                  </tr>
                  <tr class="hover:bg-gray-50/50 transition-colors border-b-transparent">
                    <td class="py-5 flex items-center gap-3">
                       <span class="text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </span>
                      <span class="font-medium text-gray-700">Créneau Populaire</span>
                    </td>
                    <td class="py-5 text-gray-800 font-medium">{{ dashboard.detailedKpis.thisMonth.popularSlot }}</td>
                    <td class="py-5 text-gray-400">{{ dashboard.detailedKpis.lastMonth.popularSlot }}</td>
                    <td class="py-5 text-right text-gray-400 italic font-medium">
                      {{ dashboard.detailedKpis.thisMonth.popularSlot === dashboard.detailedKpis.lastMonth.popularSlot ? 'Identique' : 'Différent' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-auto pt-4 w-full text-xs text-gray-400 flex justify-end items-center gap-1.5">
              <svg class="w-4 h-4 text-[#27b5c8]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
              Données en temps réel
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardPageComponent implements OnInit {
  @ViewChild('revenueChart') revenueChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('occupancyChart') occupancyChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChart!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private analyticsService = inject(AnalyticsService);

  public data = signal<GeneralDashboardData | null>(null);
  public loading = signal<boolean>(true);

  private chartInstances: any[] = [];

  ngOnInit() {
    this.analyticsService.getGeneralDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        // Wait for next tick so that the DOM renders the canvas targets
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            import('chart.js').then(({ Chart, registerables }) => {
              Chart.register(...registerables);
              this.initCharts(Chart, res);
            });
          }
        }, 0);
      },
      error: (err) => {
        console.error('Erreur de chargement du dashboard', err);
        this.loading.set(false);
      }
    });
  }

  private initCharts(ChartRef: any, dashboard: GeneralDashboardData) {
    if (!this.revenueChart || !this.occupancyChart || !this.radarChart) return;

    // Configuration commune pour les bar charts
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#374151',
          bodyColor: '#374151',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#9ca3af', font: { size: 12 } }
        },
        y: {
          display: false,
          grid: { display: false, drawBorder: false }
        }
      },
      layout: { padding: { top: 10 } }
    };

    // 1. Revenus Mensuels (Toutes les salles regroupées)
    this.chartInstances.push(
      new ChartRef(this.revenueChart.nativeElement, {
        type: 'bar',
        data: {
          labels: dashboard.charts.labels,
          datasets: [
            {
              label: 'Revenu Total',
              data: dashboard.charts.revenues,
              backgroundColor: '#1da1f2',
              borderRadius: { topLeft: 4, topRight: 4 },
              barPercentage: 0.5,
              categoryPercentage: 0.5
            }
          ]
        },
        options: commonOptions
      })
    );

    // 2. Taux d'Occupation
    this.chartInstances.push(
      new ChartRef(this.occupancyChart.nativeElement, {
        type: 'bar',
        data: {
          labels: dashboard.charts.labels,
          datasets: [
            {
              label: 'Occupation Global',
              data: dashboard.charts.occupancy,
              backgroundColor: '#27b5c8',
              borderRadius: { topLeft: 4, topRight: 4 },
              barPercentage: 0.5,
              categoryPercentage: 0.5
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: commonOptions.scales.x,
            y: {
              grid: {
                color: '#e5e7eb',
                drawBorder: false,
                borderDash: [5, 5]
              },
              ticks: { display: false },
              beginAtZero: true,
              max: 100
            }
          }
        }
      })
    );

    // 3. Analyse Multicritères (Radar Global)
    this.chartInstances.push(
      new ChartRef(this.radarChart.nativeElement, {
        type: 'radar',
        data: {
          labels: dashboard.radar.labels,
          datasets: [
            {
              label: 'Toutes les salles',
              data: dashboard.radar.data,
              backgroundColor: 'rgba(29, 161, 242, 0.2)',
              borderColor: '#1da1f2',
              pointBackgroundColor: '#1da1f2',
              pointBorderColor: '#fff',
              borderWidth: 2,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              angleLines: { color: '#f3f4f6' },
              grid: { color: '#f3f4f6', circular: true },
              pointLabels: {
                color: '#6b7280',
                font: { size: 10, weight: '600' },
                padding: 15
              },
              ticks: { display: false, min: 0, max: 100, stepSize: 25 }
            }
          }
        }
      })
    );
  }
}
