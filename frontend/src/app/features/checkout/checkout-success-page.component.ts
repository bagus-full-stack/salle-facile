import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto px-4 py-12 font-sans bg-gray-50/30 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

      @if (isLoading()) {
        <div class="col-span-1 lg:col-span-2 text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1da1f2]"></div>
          <p class="mt-4 text-gray-500">Chargement de votre reçu...</p>
        </div>
      } @else if (error()) {
        <div class="col-span-1 lg:col-span-2 text-center py-20">
          <div class="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p class="text-gray-600 mb-6">{{ error() }}</p>
          <button routerLink="/reservations" class="bg-[#1da1f2] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow transition">
            Retourner à mes réservations
          </button>
        </div>
      } @else if (reservation()) {
        <div class="space-y-6">
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>

          <h1 class="text-5xl font-extrabold text-gray-900">Paiement Réussi !</h1>
          <p class="text-lg text-gray-600">Votre réservation est confirmée. Un email récapitulatif a été envoyé à <span class="text-blue-600 font-medium">{{ reservation().user?.email }}</span>.</p>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8 space-y-4">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Détails de la transaction</h3>

            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2">📄 Référence</span>
              <span class="font-bold text-gray-900">{{ reservation().reference }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2">🏠 Salle</span>
              <span class="font-medium text-gray-900">{{ reservation().room?.name }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2">📅 Date de début</span>
              <span class="font-medium text-gray-900">{{ reservation().startTime | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-gray-500 flex items-center gap-2">⏳ Date de fin</span>
              <span class="font-medium text-gray-900">{{ reservation().endTime | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-500 flex items-center gap-2">💳 Moyen de paiement</span>
              <span class="font-medium text-gray-900">
                {{ reservation().payment?.method === 'CREDIT_CARD' ? 'Carte Bancaire' : 'Sur Place' }}
                @if (reservation().payment?.status === 'COMPLETED') { <span class="text-green-500 text-sm ml-1">(Payé)</span> }
                @else { <span class="text-orange-500 text-sm ml-1">(En attente)</span> }
              </span>
            </div>

            <div class="flex justify-between items-end pt-6 mt-2">
              <span class="text-gray-500">Montant total</span>
              <span class="text-3xl font-bold text-[#1da1f2]">{{ reservation().totalPrice }} €</span>
            </div>
          </div>

          <div class="flex gap-4 mt-8">
            <button (click)="downloadPdf()" [disabled]="isDownloading()" class="flex-1 bg-[#2b5e6e] hover:bg-[#1f4551] text-white font-bold py-4 rounded-xl shadow transition flex justify-center items-center gap-2 disabled:opacity-50">
              @if (isDownloading()) {
                <span>Génération...</span>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Télécharger le reçu</span>
              }
            </button>
            <button routerLink="/reservations" class="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-xl shadow-sm transition">
              Retour aux réservations
            </button>
          </div>
        </div>

        <div class="bg-gray-100/50 p-8 rounded-3xl border border-gray-200 flex justify-center shadow-inner ">
          <div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-8 transform rotate-1 hover:rotate-0 transition duration-300">
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8 space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Détails de la transaction</h3>

              <div class="flex justify-between items-center py-2 border-b border-gray-50">
                <span class="text-gray-500 flex items-center gap-2">📄 Référence</span>
                <span class="font-bold text-gray-900">{{ reservation().reference }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-50">
                <span class="text-gray-500 flex items-center gap-2">🏠 Salle</span>
                <span class="font-medium text-gray-900">{{ reservation().room?.name }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-50">
                <span class="text-gray-500 flex items-center gap-2">📅 Date de début</span>
                <span class="font-medium text-gray-900">{{ reservation().startTime | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-50">
                <span class="text-gray-500 flex items-center gap-2">⏳ Date de fin</span>
                <span class="font-medium text-gray-900">{{ reservation().endTime | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-500 flex items-center gap-2">💳 Moyen de paiement</span>
                <span class="font-medium text-gray-900">
                {{ reservation().payment?.method === 'CREDIT_CARD' ? 'Carte Bancaire' : 'Sur Place' }}
                  @if (reservation().payment?.status === 'COMPLETED') { <span class="text-green-500 text-sm ml-1">(Payé)</span> }
                  @else { <span class="text-orange-500 text-sm ml-1">(En attente)</span> }
              </span>
              </div>

              <div class="flex justify-between items-end pt-6 mt-2">
                <span class="text-gray-500">Montant total</span>
                <span class="text-3xl font-bold text-[#1da1f2]">{{ reservation().totalPrice }} €</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutSuccessPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public isDownloading = signal(false);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Data de la réservation
  public reservationId = signal<string | null>(null);
  public reservation = signal<any>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['reservationId'];
      this.reservationId.set(id);

      if (id) {
        this.fetchReservationDetails(id);
      } else {
        this.error.set("Aucun ID de réservation n'a été fourni dans l'URL.");
        this.isLoading.set(false);
      }
    });
  }

  fetchReservationDetails(id: string) {
    this.isLoading.set(true);
    // On appelle notre nouvelle route GET /reservations/:id
    this.http.get(`http://localhost:3000/reservations/${id}`).subscribe({
      next: (data) => {
        this.reservation.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur chargement reçu:", err);
        this.error.set("Impossible de récupérer les détails de la réservation.");
        this.isLoading.set(false);
      }
    });
  }

  downloadPdf() {
    if (!this.reservationId()) {
      alert("Erreur: ID de réservation manquant.");
      return;
    }
    this.isDownloading.set(true);

    this.http.get(`http://localhost:3000/billing/${this.reservationId()}/receipt`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recu-${this.reservationId()}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          this.isDownloading.set(false);
        },
        error: () => {
          this.isDownloading.set(false);
          alert("Erreur lors du téléchargement du PDF.");
        }
      });
  }
}
