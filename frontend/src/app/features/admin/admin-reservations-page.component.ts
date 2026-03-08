import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminReservationsService, AdminReservation } from '../../core/services/admin-reservations.service';

@Component({
  selector: 'app-admin-reservations-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex justify-between items-end mb-8">
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path></svg>
            Dashboard / Réservations
          </div>
          <h1 class="text-3xl font-extrabold text-gray-900">Registre des Réservations</h1>
          <p class="text-gray-500 mt-1">Supervisez et gérez l'ensemble des réservations du système.</p>
        </div>

        <div class="flex gap-3">
          <div class="flex bg-gray-200 p-1 rounded-lg">
            <button (click)="currentFilter.set('ALL')" [class.bg-white]="currentFilter() === 'ALL'" [class.shadow-sm]="currentFilter() === 'ALL'" class="px-4 py-1.5 text-sm font-semibold rounded-md text-gray-700 transition">Toutes</button>
            <button (click)="currentFilter.set('CONFIRMED')" [class.bg-white]="currentFilter() === 'CONFIRMED'" [class.shadow-sm]="currentFilter() === 'CONFIRMED'" class="px-4 py-1.5 text-sm font-semibold rounded-md text-gray-700 transition">Confirmées</button>
            <button (click)="currentFilter.set('PENDING')" [class.bg-white]="currentFilter() === 'PENDING'" [class.shadow-sm]="currentFilter() === 'PENDING'" class="px-4 py-1.5 text-sm font-semibold rounded-md text-gray-700 transition">En attente</button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div class="relative w-72">
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input type="text" placeholder="Rechercher (Nom, Réf...)" class="w-full border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#1da1f2] outline-none">
          </div>
          <button class="text-sm text-[#1da1f2] font-semibold hover:underline">Exporter CSV</button>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b648f]"></div>
          </div>
        } @else {
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-white text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th class="px-6 py-4">Référence & Client</th>
                <th class="px-6 py-4">Salle & Dates</th>
                <th class="px-6 py-4">Montant</th>
                <th class="px-6 py-4">Statut Résa</th>
                <th class="px-6 py-4">Paiement</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-gray-700">

              @for (res of filteredReservations(); track res.id) {
                <tr class="hover:bg-gray-50 transition">

                  <td class="px-6 py-4">
                    <div class="font-bold text-gray-900">{{ res.reference }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ res.user.firstName }} {{ res.user.lastName }}</div>
                    <div class="text-xs text-blue-500">{{ res.user.email }}</div>
                  </td>

                  <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 flex items-center gap-1">
                      <span class="text-gray-400">🏢</span> {{ res.room.name }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Du: {{ res.startTime | date:'dd MMM yyyy, HH:mm':'':'fr-FR' }}</div>
                    <div class="text-xs text-gray-500">Au: {{ res.endTime | date:'dd MMM yyyy, HH:mm':'':'fr-FR' }}</div>
                  </td>

                  <td class="px-6 py-4 font-extrabold text-gray-900">
                    {{ res.totalPrice | currency:'EUR' }}
                  </td>

                  <td class="px-6 py-4">
                    @if (res.status === 'CONFIRMED') {
                      <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">✔ Confirmée</span>
                    } @else if (res.status === 'PENDING') {
                      <span class="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">⏳ En attente</span>
                    } @else {
                      <span class="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">✖ Annulée</span>
                    }
                  </td>

                  <td class="px-6 py-4">
                    @if (res.payment) {
                      @if (res.payment.status === 'COMPLETED') {
                        <div class="text-xs font-bold text-green-600 flex items-center gap-1">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                          Payé ({{ res.payment.method === 'CREDIT_CARD' ? 'CB' : 'Sur Place' }})
                        </div>
                      } @else if (res.payment.status === 'REFUNDED') {
                        <div class="text-xs font-bold text-gray-500">Remboursé</div>
                      } @else {
                        <div class="text-xs font-bold text-yellow-600">À encaisser</div>
                      }
                    } @else {
                      <span class="text-gray-400 text-xs">-</span>
                    }
                  </td>

                  <td class="px-6 py-4 text-right">
                    @if (res.status !== 'CANCELLED') {
                      <button
                        (click)="forceCancel(res.id, res.reference)"
                        class="bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded transition shadow-sm">
                        Forcer Annulation
                      </button>
                    }
                  </td>
                </tr>
              }

              @if (filteredReservations().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-3">📭</div>
                    Aucune réservation trouvée pour ce filtre.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class AdminReservationsPageComponent implements OnInit {
  private adminResService = inject(AdminReservationsService);

  // État avec Signals
  public reservations = signal<AdminReservation[]>([]);
  public isLoading = signal<boolean>(true);

  // Filtre actuel (Toutes, Confirmées, En attente)
  public currentFilter = signal<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');

  // ⚡️ Signal calculé dynamiquement : le tableau se met à jour tout seul quand on clique sur un filtre !
  public filteredReservations = computed(() => {
    const filter = this.currentFilter();
    const all = this.reservations();

    if (filter === 'ALL') return all;
    return all.filter(res => res.status === filter);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.adminResService.getAll().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement résas', err);
        this.isLoading.set(false);
      }
    });
  }

  forceCancel(id: string, reference: string) {
    // Alerte native forte pour éviter les erreurs de clic
    const confirmMsg = `⚠️ ATTENTION ⚠️\n\nVous êtes sur le point d'annuler manuellement la réservation ${reference}.\nCette action va contourner la règle des 24h et déclencher un remboursement si le client a déjà payé en ligne.\n\nConfirmez-vous cette action ?`;

    if (window.confirm(confirmMsg)) {
      this.adminResService.forceCancel(id).subscribe({
        next: () => {
          // Mise à jour optimiste du tableau sans recharger la page
          this.reservations.update(list =>
            list.map(r => r.id === id ? { ...r, status: 'CANCELLED', payment: r.payment ? { ...r.payment, status: 'REFUNDED' } : null } : r)
          );
          alert('Réservation annulée avec succès.');
        },
        error: (err) => {
          alert('Erreur lors de l\'annulation forcée.');
          console.error(err);
        }
      });
    }
  }
}
