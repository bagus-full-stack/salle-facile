import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 font-sans">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stat Card 1 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Réservations (ce mois)</div>
          <div class="text-3xl font-extrabold text-gray-900">124</div>
          <div class="text-green-500 text-sm font-semibold mt-1">↑ +12%</div>
        </div>

        <!-- Stat Card 2 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Revenus (ce mois)</div>
          <div class="text-3xl font-extrabold text-gray-900">4,250 €</div>
          <div class="text-green-500 text-sm font-semibold mt-1">↑ +5%</div>
        </div>

        <!-- Stat Card 3 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Nouveaux clients</div>
          <div class="text-3xl font-extrabold text-gray-900">18</div>
          <div class="text-red-500 text-sm font-semibold mt-1">↓ -2%</div>
        </div>

        <!-- Stat Card 4 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Salles actives</div>
          <div class="text-3xl font-extrabold text-gray-900">8/10</div>
          <div class="text-gray-400 text-sm font-semibold mt-1">2 en maintenance</div>
        </div>
      </div>

      <!-- Nouveaux Graphiques & KPIs -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Card Revenus -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Revenus Mensuels</h3>
              <p class="text-sm text-[#27b5c8]">Revenu total (k€) par mois</p>
            </div>
            <span class="bg-[#e6f7fa] text-[#1e9aa9] text-xs font-bold px-2 py-1 rounded"> +12.5% vs prev. </span>
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
              <p class="text-sm text-[#27b5c8]">Occupation (%) par mois</p>
            </div>
            <span class="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded"> Moyenne: 72% </span>
          </div>
          <div class="flex-grow mt-6 w-full h-[250px] relative">
            <canvas #occupancyChart></canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Analyse Multicritères -->
        <div class="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 class="text-lg font-semibold text-gray-900 w-full text-left mb-2">Analyse Multicritères</h3>
          <div class="w-full relative h-[300px] flex justify-center items-center">
            <canvas #radarChart></canvas>
          </div>
          <div class="flex gap-6 mt-4 text-sm text-gray-500 font-medium">
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#5185fc]"></span> Petit F.</div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#27b5c8]"></span> Grand F.</div>
          </div>
        </div>

        <!-- Détails des KPIs -->
        <div class="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Détails des KPIs</h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="text-[#27b5c8] uppercase tracking-wider font-semibold text-xs border-b border-gray-100">
                  <th class="pb-4 pt-2">INDICATEUR</th>
                  <th class="pb-4 pt-2">SALLE PETIT FORMAT</th>
                  <th class="pb-4 pt-2">SALLE GRAND FORMAT</th>
                  <th class="pb-4 pt-2 text-right">DIFFÉRENCE</th>
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
                  <td class="py-5 font-bold">45</td>
                  <td class="py-5 font-bold">32</td>
                  <td class="py-5 text-right">
                    <span class="bg-red-50/50 text-red-500 font-bold px-2.5 py-1 rounded text-xs">-28.8%</span>
                  </td>
                </tr>
                <tr class="border-b border-gray-50/70 hover:bg-gray-50/50 transition-colors">
                   <td class="py-5 flex items-center gap-3">
                    <span class="text-gray-400">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </span>
                    <span class="font-medium text-gray-700">Revenu Total</span>
                  </td>
                  <td class="py-5 font-bold">12, 500€</td>
                  <td class="py-5 font-bold">18, 200€</td>
                  <td class="py-5 text-right">
                    <span class="bg-green-50/60 text-[#10b981] font-bold px-2.5 py-1 rounded text-xs">+45.6%</span>
                  </td>
                </tr>
                <tr class="border-b border-gray-50/70 hover:bg-gray-50/50 transition-colors">
                   <td class="py-5 flex items-center gap-3">
                     <span class="text-gray-400">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </span>
                    <span class="font-medium text-gray-700">Taux d'Occupation</span>
                  </td>
                  <td class="py-5 font-bold">78%</td>
                  <td class="py-5 font-bold">65%</td>
                  <td class="py-5 text-right">
                    <span class="bg-red-50/50 text-red-500 font-bold px-2.5 py-1 rounded text-xs">-13 pts</span>
                  </td>
                </tr>
                <tr class="hover:bg-gray-50/50 transition-colors border-b-transparent">
                  <td class="py-5 flex items-center gap-3">
                     <span class="text-gray-400">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                    <span class="font-medium text-gray-700">Créneau Populaire</span>
                  </td>
                  <td class="py-5 text-gray-600">14:00 - 16:00</td>
                  <td class="py-5 text-gray-600">09:00 - 12:00</td>
                  <td class="py-5 text-right text-gray-400 italic font-medium">
                    Différent
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-auto pt-4 w-full text-xs text-gray-400 flex justify-end items-center gap-1.5">
            <svg class="w-4 h-4 text-[#27b5c8]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
            Données mises à jour il y a 2h
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardPageComponent implements AfterViewInit {
  @ViewChild('revenueChart') revenueChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('occupancyChart') occupancyChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChart!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private chartInstances: any[] = [];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      import('chart.js').then(({ Chart, registerables }) => {
        Chart.register(...registerables);
        this.initCharts(Chart);
      });
    }
  }

  private initCharts(ChartRef: any) {
    const labels = ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

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

    // 1. Revenus Mensuels
    this.chartInstances.push(
      new ChartRef(this.revenueChart.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Petit Format',
              data: [15, 20, 12, 28, 20, 30],
              backgroundColor: '#5185fc',
              borderRadius: { topLeft: 4, topRight: 4 },
              barPercentage: 0.6,
              categoryPercentage: 0.5
            },
            {
              label: 'Grand Format',
              data: [22, 16, 25, 32, 24, 18],
              backgroundColor: '#27b5c8',
              borderRadius: { topLeft: 4, topRight: 4 },
              barPercentage: 0.6,
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
          labels,
          datasets: [
            {
              label: 'Petit Format',
              data: [60, 75, 85, 88, 75, 75],
              backgroundColor: '#5185fc',
              borderRadius: { topLeft: 4, topRight: 4 },
              barPercentage: 0.6,
              categoryPercentage: 0.5
            },
            {
              label: 'Grand Format',
              data: [50, 79, 65, 80, 85, 80],
              backgroundColor: '#27b5c8',
              borderRadius: { topLeft: 4, topRight: 4 },
              barPercentage: 0.6,
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

    // 3. Analyse Multicritères (Radar)
    const radarLabels = ['POPULARITÉ', 'DURÉE MOY.', 'RENTABILITÉ', 'NOTE CLIENT', ' '];
    this.chartInstances.push(
      new ChartRef(this.radarChart.nativeElement, {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: [
            {
              label: 'Petit F.',
              data: [90, 60, 70, 85, 0],
              backgroundColor: 'rgba(81, 133, 252, 0.2)',
              borderColor: 'rgba(81, 133, 252, 0)',
              pointBackgroundColor: 'rgba(0,0,0,0)',
              pointBorderColor: 'rgba(0,0,0,0)',
              borderWidth: 0,
              fill: true
            },
            {
              label: 'Grand F.',
              data: [70, 85, 95, 75, 0],
              backgroundColor: 'rgba(39, 181, 200, 0.2)',
              borderColor: 'rgba(39, 181, 200, 0)',
              pointBackgroundColor: 'rgba(0,0,0,0)',
              pointBorderColor: 'rgba(0,0,0,0)',
              borderWidth: 0,
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
                color: '#27b5c8',
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
