import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto px-4 py-12 font-sans bg-gray-50/30 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

      <div class="space-y-6">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h1 class="text-5xl font-extrabold text-gray-900">Paiement Réussi !</h1>
        <p class="text-lg text-gray-600">Votre réservation est confirmée. Un email récapitulatif a été envoyé à <span class="text-blue-600 font-medium">jean.dupont@email.com</span>.</p>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8 space-y-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Détails de la transaction</h3>

          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500 flex items-center gap-2">📄 Référence</span>
            <span class="font-bold text-gray-900">#SF-2023-889</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500 flex items-center gap-2">📅 Date</span>
            <span class="font-medium text-gray-900">24 Oct 2023, 14:30</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-gray-500 flex items-center gap-2">💳 Moyen de paiement</span>
            <span class="font-medium text-gray-900">Visa •••• 4242</span>
          </div>

          <div class="flex justify-between items-end pt-6 mt-2">
            <span class="text-gray-500">Montant total</span>
            <span class="text-3xl font-bold text-[#1da1f2]">1 250,00 €</span>
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button (click)="downloadPdf()" [disabled]="isDownloading()" class="flex-1 bg-[#2b5e6e] hover:bg-[#1f4551] text-white font-bold py-4 rounded-xl shadow transition flex justify-center items-center gap-2">
            @if (isDownloading()) {
              <span>Génération...</span>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Télécharger le reçu</span>
            }
          </button>
          <button class="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-xl shadow-sm transition">
            Retour aux réservations
          </button>
        </div>
      </div>

      <div class="bg-gray-100/50 p-8 rounded-3xl border border-gray-200 flex justify-center shadow-inner">
        <div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-8 transform rotate-1 hover:rotate-0 transition duration-300">
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center gap-2 font-bold text-[#2b5e6e]">
              <span class="text-lg">🏢</span> SalleFacile
            </div>
            <div class="text-right">
              <div class="text-2xl font-light text-gray-300 tracking-widest">REÇU</div>
              <div class="text-xs text-gray-400">#SF-2023-889</div>
            </div>
          </div>

          <div class="flex justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
            <div>
              <div class="font-bold text-gray-500 uppercase tracking-wider mb-1">DE</div>
              <div class="font-bold text-gray-800">SalleFacile Inc.</div>
              <div class="text-gray-500">12 Rue de la Paix</div>
              <div class="text-gray-500">75002 Paris, France</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-gray-500 uppercase tracking-wider mb-1">FACTURÉ À</div>
              <div class="font-bold text-gray-800">Jean Dupont</div>
              <div class="text-gray-500">Startup Innovante SAS</div>
              <div class="text-gray-500">jean.dupont@email.com</div>
            </div>
          </div>

          <table class="w-full text-xs mb-4">
            <thead>
              <tr class="text-gray-400 border-b border-gray-100">
                <th class="text-left pb-2 font-medium">Description</th>
                <th class="text-center pb-2 font-medium">Qté</th>
                <th class="text-right pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr class="border-b border-gray-50">
                <td class="py-2 pr-2">Location Salle "L'Atelier" - Journée complète</td>
                <td class="py-2 text-center">1</td>
                <td class="py-2 text-right">950,00 €</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-2 pr-2">Pack Traiteur (Déjeuner + Café)</td>
                <td class="py-2 text-center">12</td>
                <td class="py-2 text-right">240,00 €</td>
              </tr>
              <tr>
                <td class="py-2 pr-2">Frais de service</td>
                <td class="py-2 text-center">1</td>
                <td class="py-2 text-right">60,00 €</td>
              </tr>
            </tbody>
          </table>

          <div class="text-xs text-right space-y-1 border-t border-gray-100 pt-3 mb-4">
            <div class="flex justify-between text-gray-500"><span>Sous-total</span><span>1 250,00 €</span></div>
            <div class="flex justify-between text-gray-500"><span>TVA (20%)</span><span>Inclus</span></div>
          </div>

          <div class="border-t border-dashed border-gray-200 pt-4 flex justify-between font-bold text-gray-900">
            <span>Total Payé</span>
            <span class="text-[#1da1f2]">1 250,00 €</span>
          </div>

          <p class="text-xs text-gray-400 text-center mt-6 italic">Merci de votre confiance. Ce document vaut preuve de paiement.</p>
        </div>
      </div>

    </div>
  `
})
export class CheckoutSuccessPageComponent {
  private http = inject(HttpClient);
  public isDownloading = signal(false);

  // Simulation d'un ID de réservation (en temps normal, on le récupère via le router/state)
  private reservationId = '123e4567-e89b-12d3-a456-426614174000';

  downloadPdf() {
    this.isDownloading.set(true);

    // On demande explicitement un Blob (fichier binaire) à HttpClient
    this.http.get(`http://localhost:3000/billing/${this.reservationId}/receipt`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          // Création d'un lien temporaire dans le DOM pour forcer le téléchargement
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recu-${this.reservationId}.pdf`;
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
