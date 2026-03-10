import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

interface ReservationState {
  reservation: { id: string; reference: string; startTime: string; totalPrice: number };
  paymentMethod: 'CREDIT_CARD' | 'ONSITE';
  room: { name: string };
}

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto px-4 py-12 font-sans bg-gray-50/30 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

      <div class="space-y-6">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h1 class="text-5xl font-extrabold text-gray-900">Paiement Réussi !</h1>
        <p class="text-lg text-gray-600">Votre réservation est confirmée. Un email récapitulatif a été envoyé à votre adresse.</p>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8 space-y-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Détails de la transaction</h3>

          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500 flex items-center gap-2">📄 Référence</span>
            <span class="font-bold text-gray-900">{{ reservationState()?.reservation?.reference ?? '—' }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500 flex items-center gap-2">📅 Date</span>
            <span class="font-medium text-gray-900">
              {{ reservationState()?.reservation?.startTime ? (reservationState()!.reservation.startTime | date:'d MMM yyyy, HH:mm':'':'fr-FR') : '—' }}
            </span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-gray-500 flex items-center gap-2">💳 Moyen de paiement</span>
            <span class="font-medium text-gray-900">
              {{ reservationState()?.paymentMethod === 'CREDIT_CARD' ? 'Carte de crédit' : 'Sur place' }}
            </span>
          </div>

          <div class="flex justify-between items-end pt-6 mt-2">
            <span class="text-gray-500">Montant total</span>
            <span class="text-3xl font-bold text-[#1da1f2]">
              {{ reservationState()?.reservation?.totalPrice ? (reservationState()!.reservation.totalPrice | number:'1.2-2') + ' €' : '—' }}
            </span>
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button (click)="downloadPdf()" [disabled]="isDownloading() || !reservationState()" class="flex-1 bg-[#2b5e6e] hover:bg-[#1f4551] text-white font-bold py-4 rounded-xl shadow transition flex justify-center items-center gap-2 disabled:opacity-50">
            @if (isDownloading()) {
              <span>Génération...</span>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Télécharger le reçu</span>
            }
          </button>
          <a routerLink="/mon-espace" class="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-xl shadow-sm transition flex items-center justify-center">
            Retour aux réservations
          </a>
        </div>
      </div>

      <div class="bg-gray-100/50 p-8 rounded-3xl border border-gray-200 flex justify-center shadow-inner">
        <div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-8 transform rotate-1 hover:rotate-0 transition duration-300">
          <div class="flex justify-between items-start mb-8">
            <div class="font-bold text-[#2b5e6e]">SalleFacile</div>
            <div class="text-right">
              <div class="text-2xl font-light text-gray-300 tracking-widest">REÇU</div>
              <div class="text-xs text-gray-400">{{ reservationState()?.reservation?.reference ?? '—' }}</div>
            </div>
          </div>
          @if (reservationState()?.room) {
            <div class="mb-4 text-sm text-gray-600 border-b border-dashed border-gray-200 pb-4">
              <p class="font-medium text-gray-900">{{ reservationState()!.room.name }}</p>
              <p>{{ reservationState()?.reservation?.startTime | date:'d MMM yyyy':'':'fr-FR' }}</p>
            </div>
          }
          <div class="border-t border-dashed border-gray-200 pt-4 flex justify-between font-bold text-gray-900">
            <span>Total Payé</span>
            <span class="text-[#1da1f2]">
              {{ reservationState()?.reservation?.totalPrice ? (reservationState()!.reservation.totalPrice | number:'1.2-2') + ' €' : '—' }}
            </span>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CheckoutSuccessPageComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  public isDownloading = signal(false);
  public reservationState = signal<ReservationState | null>(null);

  constructor() {
    // Read reservation data from router state
    const navigation = this.router.getCurrentNavigation();
    const state = (navigation?.extras?.state ?? (typeof window !== 'undefined' ? window.history.state : null)) as ReservationState | null;
    if (state?.reservation) {
      this.reservationState.set(state);
    }
  }

  downloadPdf() {
    const state = this.reservationState();
    if (!state?.reservation?.id) return;

    const reservationId = state.reservation.id;
    this.isDownloading.set(true);

    this.http.get(`http://localhost:3000/billing/${reservationId}/receipt`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recu-${state.reservation.reference}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.isDownloading.set(false);
        },
        error: () => {
          this.isDownloading.set(false);
          alert('Erreur lors du téléchargement du PDF.');
        }
      });
  }
}
