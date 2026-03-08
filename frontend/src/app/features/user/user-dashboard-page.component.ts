import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface UserReservation {
  id: string;
  room: { name: string };
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  payment: { status: string };
}

@Component({
  selector: 'app-user-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon Espace Personnel</h1>

      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 flex gap-3">
        <div class="text-blue-500 font-bold mt-0.5">ℹ</div>
        <div>
          <h3 class="font-bold text-blue-900 text-sm">Politique d'Annulation</h3>
          <p class="text-blue-800 text-sm">Les annulations sont gratuites jusqu'à <b>24 heures</b> avant le début. Passé ce délai, veuillez contacter le support.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">Réservations Actuelles 📅</h3>
          <p class="text-4xl font-extrabold text-gray-900">{{ activeCount() }}</p>
          <p class="text-sm text-gray-500 mt-1">Réservations à venir.</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">Réservations Terminées ✔️</h3>
          <p class="text-4xl font-extrabold text-gray-900">{{ pastCount() }}</p>
          <p class="text-sm text-gray-500 mt-1">Événements passés.</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">Paiements en Attente 💳</h3>
          <p class="text-4xl font-extrabold text-[#1da1f2]">{{ pendingAmount() }} €</p>
          <p class="text-sm text-gray-500 mt-1">À régler sur place ou en ligne.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">Historique des Réservations</h2>
          <button class="text-sm font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Exporter en PDF</button>
        </div>

        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b">
            <tr>
              <th class="px-6 py-4">Salle</th>
              <th class="px-6 py-4">Dates</th>
              <th class="px-6 py-4">Montant Total</th>
              <th class="px-6 py-4">Statut / Paiement</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (res of reservations(); track res.id) {
              <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-bold text-gray-900">{{ res.room.name }}</td>
                <td class="px-6 py-4">
                  <div class="text-gray-900 font-medium">{{ res.startTime | date:'dd/MM/yyyy' }}</div>
                  @if (res.status !== 'CANCELLED') {
                    @if (isCancelable(res.startTime)) {
                      <span class="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex w-max mt-1">✔ ANNULABLE</span>
                    } @else {
                      <span class="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full flex w-max mt-1">⏱ MOINS DE 24H</span>
                    }
                  }
                </td>
                <td class="px-6 py-4 font-bold">{{ res.totalPrice }} €</td>
                <td class="px-6 py-4">
                  @if (res.status === 'CANCELLED') {
                    <span class="text-xs bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-full">Annulé</span>
                  } @else if (res.payment.status === 'COMPLETED') {
                    <span class="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">Payé</span>
                  } @else {
                    <span class="text-xs bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full">En attente</span>
                  }
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button class="text-sm font-semibold border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50">Détails</button>

                  @if (res.status !== 'CANCELLED' && isCancelable(res.startTime)) {
                    <button (click)="cancel(res.id)" class="text-sm font-semibold bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition">
                      Annuler
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UserDashboardPageComponent implements OnInit {
  private http = inject(HttpClient);

  public reservations = signal<UserReservation[]>([]);

  // ⚡️ Calculs réactifs ! Si 'reservations' change (ex: après annulation), ces 3 variables se mettent à jour instantanément.
  public activeCount = computed(() => this.reservations().filter(r => r.status !== 'CANCELLED' && new Date(r.startTime) >= new Date()).length);
  public pastCount = computed(() => this.reservations().filter(r => new Date(r.startTime) < new Date()).length);
  public pendingAmount = computed(() =>
    this.reservations()
      .filter(r => r.status !== 'CANCELLED' && r.payment.status !== 'COMPLETED')
      .reduce((sum, r) => sum + Number(r.totalPrice), 0)
  );

  ngOnInit() {
    this.http.get<UserReservation[]>('http://localhost:3000/reservations/me').subscribe(data => this.reservations.set(data));
  }

  isCancelable(startTimeStr: string): boolean {
    const start = new Date(startTimeStr);
    const now = new Date();
    const hoursDiff = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  }

  cancel(id: string) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.http.patch(`http://localhost:3000/reservations/${id}/cancel`, {}).subscribe({
        next: () => {
          // Mise à jour optimiste de l'UI
          this.reservations.update(res => res.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
        },
        error: (err) => alert(err.error.message || "Erreur d'annulation")
      });
    }
  }
}
