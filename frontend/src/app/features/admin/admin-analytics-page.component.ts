import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

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
          <p class="text-[#1da1f2]">Comparaison de performance: Salle Petit Format vs Salle Grand Format</p>
        </div>
        <div class="flex gap-4">
          <button class="bg-white border px-4 py-2 rounded-lg text-sm font-medium shadow-sm">Derniers 30 jours ⌄</button>
          <button class="bg-[#0b648f] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#084a6b] transition">Exporter Rapport</button>
        </div>
      </div>

      <div class="flex gap-6 mb-6">
        <div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#60a5fa]"></span> Salle Petit Format</div>
        <div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#2dd4bf]"></span> Salle Grand Format</div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Revenus Mensuels</h2>
              <p class="text-sm text-gray-500">Revenu total (k€) par mois</p>
            </div>
            <span class="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">+12.5% vs prev.</span>
          </div>
          <canvas #revenueChart height="250"></canvas>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Taux d'Occupation</h2>
              <p class="text-sm text-gray-500">Occupation (%) par mois</p>
            </div>
            <span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Moyenne: 72%</span>
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
                <th class="py-4">Salle Petit Format</th>
                <th class="py-4">Salle Grand Format</th>
                <th class="py-4">Différence</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-900">
              <tr>
                <td class="py-5 font-medium text-gray-600">Total Réservations</td>
                <td class="py-5 font-extrabold text-lg">45</td>
                <td class="py-5 font-extrabold text-lg">32</td>
                <td class="py-5"><span class="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">-28.8%</span></td>
              </tr>
              <tr>
                <td class="py-5 font-medium text-gray-600">Revenu Total</td>
                <td class="py-5 font-extrabold text-lg">12 500€</td>
                <td class="py-5 font-extrabold text-lg">18 200€</td>
                <td class="py-5"><span class="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold">+45.6%</span></td>
              </tr>
            </tbody>
          </table>
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

  ngAfterViewInit() {
    // On appelle l'API une fois que les Canvas sont dessinés dans le DOM
    this.http.get<any>('http://localhost:3000/admin/analytics/compare').subscribe(data => {
      this.initCharts(data);
    });
  }

  initCharts(data: any) {
    // 1. Chart Revenus
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
