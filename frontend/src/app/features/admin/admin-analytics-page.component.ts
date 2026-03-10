import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

interface RoomKpi {
  totalReservations: number;
  totalRevenue: number;
  avgOccupancy: number;
  popularTimeSlot: string;
}

interface ComparativeData {
  labels: string[];
  datasets: { label: string; revenueData: number[]; occupancyData: number[] }[];
  radar: { labels: string[]; petitFormat: number[]; grandFormat: number[] };
  kpis: { room1: RoomKpi; room2: RoomKpi };
}

@Component({
  selector: 'app-admin-analytics-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Analyses Comparatives</h1>
          <p class="text-[#1da1f2]">Comparaison de performance: {{ roomLabel1() }} vs {{ roomLabel2() }}</p>
        </div>
        <div class="flex gap-4">
          <button class="bg-white border px-4 py-2 rounded-lg text-sm font-medium shadow-sm">Derniers 30 jours ⌄</button>
          <button class="bg-[#0b648f] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#084a6b] transition">Exporter Rapport</button>
        </div>
      </div>

      <div class="flex gap-6 mb-6">
        <div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#60a5fa]"></span> {{ roomLabel1() }}</div>
        <div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#2dd4bf]"></span> {{ roomLabel2() }}</div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Revenus Mensuels</h2>
              <p class="text-sm text-gray-500">Revenu total (€) par mois</p>
            </div>
            @if (revenueGrowth() !== null) {
              <span class="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{{ revenueGrowth() }}% vs prev.</span>
            }
          </div>
          <canvas #revenueChart height="250"></canvas>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Taux d'Occupation</h2>
              <p class="text-sm text-gray-500">Occupation (%) par mois</p>
            </div>
            @if (avgOccupancy() !== null) {
              <span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Moyenne: {{ avgOccupancy() }}%</span>
            }
          </div>
          <canvas #occupancyChart height="250"></canvas>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-6 text-center">Analyse Multicritères</h2>
          <div class="w-full flex justify-center">
             <canvas #radarChart height="300"></canvas>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-6">Détails des KPIs</h2>
          <table class="w-full text-left text-sm">
            <thead class="text-[#0b648f] text-xs font-bold uppercase tracking-wider border-b">
              <tr>
                <th class="py-4">Indicateur</th>
                <th class="py-4">{{ roomLabel1() }}</th>
                <th class="py-4">{{ roomLabel2() }}</th>
                <th class="py-4">Différence</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-900">
              @if (kpiData(); as kpis) {
                <tr>
                  <td class="py-5 font-medium text-gray-600 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Total Réservations
                  </td>
                  <td class="py-5 font-extrabold text-lg">{{ kpis.room1.totalReservations }}</td>
                  <td class="py-5 font-extrabold text-lg">{{ kpis.room2.totalReservations }}</td>
                  <td class="py-5">
                    @if (kpis.room1.totalReservations > 0) {
                      @let diffRes = ((kpis.room2.totalReservations - kpis.room1.totalReservations) / kpis.room1.totalReservations * 100).toFixed(1);
                      <span [class]="(kpis.room2.totalReservations >= kpis.room1.totalReservations ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') + ' px-2 py-1 rounded text-xs font-bold'">
                        {{ (kpis.room2.totalReservations >= kpis.room1.totalReservations ? '+' : '') + diffRes }}%
                      </span>
                    }
                  </td>
                </tr>
                <tr>
                  <td class="py-5 font-medium text-gray-600 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    Revenu Total
                  </td>
                  <td class="py-5 font-extrabold text-lg">{{ kpis.room1.totalRevenue | number:'1.0-0' }}€</td>
                  <td class="py-5 font-extrabold text-lg">{{ kpis.room2.totalRevenue | number:'1.0-0' }}€</td>
                  <td class="py-5">
                    @if (kpis.room1.totalRevenue > 0) {
                      @let diffRev = ((kpis.room2.totalRevenue - kpis.room1.totalRevenue) / kpis.room1.totalRevenue * 100).toFixed(1);
                      <span [class]="(kpis.room2.totalRevenue >= kpis.room1.totalRevenue ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') + ' px-2 py-1 rounded text-xs font-bold'">
                        {{ (kpis.room2.totalRevenue >= kpis.room1.totalRevenue ? '+' : '') + diffRev }}%
                      </span>
                    }
                  </td>
                </tr>
                <tr>
                  <td class="py-5 font-medium text-gray-600 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Taux d'Occupation
                  </td>
                  <td class="py-5 font-extrabold text-lg">{{ kpis.room1.avgOccupancy }}%</td>
                  <td class="py-5 font-extrabold text-lg">{{ kpis.room2.avgOccupancy }}%</td>
                  <td class="py-5">
                    @let diffOcc = kpis.room2.avgOccupancy - kpis.room1.avgOccupancy;
                    <span [class]="(diffOcc >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') + ' px-2 py-1 rounded text-xs font-bold'">
                      {{ (diffOcc >= 0 ? '+' : '') + diffOcc }} pts
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="py-5 font-medium text-gray-600 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Créneau Populaire
                  </td>
                  <td class="py-5 font-semibold text-gray-700">{{ kpis.room1.popularTimeSlot }}</td>
                  <td class="py-5 font-semibold text-gray-700">{{ kpis.room2.popularTimeSlot }}</td>
                  <td class="py-5">
                    <span [class]="kpis.room1.popularTimeSlot === kpis.room2.popularTimeSlot ? 'text-green-600' : 'italic text-blue-500'">
                      {{ kpis.room1.popularTimeSlot === kpis.room2.popularTimeSlot ? 'Identique' : 'Différent' }}
                    </span>
                  </td>
                </tr>
              } @else {
                <tr>
                  <td colspan="4" class="py-8 text-center text-gray-400">Chargement des données...</td>
                </tr>
              }
            </tbody>
          </table>
          <p class="text-xs text-gray-400 text-right mt-4">ℹ Données mises à jour il y a 2h</p>
        </div>

      </div>
    </div>
  `
})
export class AdminAnalyticsPageComponent implements AfterViewInit {
  private http = inject(HttpClient);

  // Récupération des canvas HTML depuis le template
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('occupancyChart') occupancyChartRef!: ElementRef;
  @ViewChild('radarChart') radarChartRef!: ElementRef;

  public roomLabel1 = signal<string>('Salle 1');
  public roomLabel2 = signal<string>('Salle 2');
  public kpiData = signal<ComparativeData['kpis'] | null>(null);
  public revenueGrowth = signal<string | null>(null);
  public avgOccupancy = signal<number | null>(null);

  ngAfterViewInit() {
    // On appelle l'API une fois que les Canvas sont dessinés dans le DOM
    this.http.get<ComparativeData>('http://localhost:3000/admin/analytics/compare').subscribe(data => {
      this.roomLabel1.set(data.datasets[0]?.label ?? 'Salle 1');
      this.roomLabel2.set(data.datasets[1]?.label ?? 'Salle 2');
      this.kpiData.set(data.kpis);

      // Calcul de la croissance des revenus entre avant-dernier et dernier mois
      const rev1 = data.datasets[0]?.revenueData ?? [];
      const rev2 = data.datasets[1]?.revenueData ?? [];
      const lastTotal = (rev1[rev1.length - 1] ?? 0) + (rev2[rev2.length - 1] ?? 0);
      const prevTotal = (rev1[rev1.length - 2] ?? 0) + (rev2[rev2.length - 2] ?? 0);
      if (prevTotal > 0) {
        const growth = ((lastTotal - prevTotal) / prevTotal * 100).toFixed(1);
        this.revenueGrowth.set((lastTotal >= prevTotal ? '+' : '') + growth);
      }

      // Taux d'occupation moyen global
      if (data.kpis) {
        const avg = Math.round((data.kpis.room1.avgOccupancy + data.kpis.room2.avgOccupancy) / 2);
        this.avgOccupancy.set(avg);
      }

      this.initCharts(data);
    });
  }

  initCharts(data: ComparativeData) {
    new Chart(this.revenueChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          { label: data.datasets[0].label, data: data.datasets[0].revenueData, backgroundColor: '#60a5fa', borderRadius: 4 }, // Bleu
          { label: data.datasets[1].label, data: data.datasets[1].revenueData, backgroundColor: '#2dd4bf', borderRadius: 4 }  // Vert/Teal
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // 2. Chart Occupation
    new Chart(this.occupancyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          { label: data.datasets[0].label, data: data.datasets[0].occupancyData, backgroundColor: '#3b82f6', borderRadius: 4 },
          { label: data.datasets[1].label, data: data.datasets[1].occupancyData, backgroundColor: '#0ea5e9', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // 3. Radar Chart
    new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: data.radar.labels,
        datasets: [
          {
            label: 'Petit Format',
            data: data.radar.petitFormat,
            backgroundColor: 'rgba(96, 165, 250, 0.4)', // Bleu transparent
            borderColor: '#60a5fa',
            pointBackgroundColor: '#60a5fa',
          },
          {
            label: 'Grand Format',
            data: data.radar.grandFormat,
            backgroundColor: 'rgba(45, 212, 191, 0.4)', // Vert transparent
            borderColor: '#2dd4bf',
            pointBackgroundColor: '#2dd4bf',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { suggestedMin: 0, suggestedMax: 100 } }, // Force le radar de 0 à 100
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
