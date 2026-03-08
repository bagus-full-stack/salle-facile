import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-room-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50/50 min-h-screen font-sans">

      <div class="flex justify-between items-center mb-8">
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path></svg>
            Dashboard / Salles / Édition
          </div>
          <h1 class="text-3xl font-extrabold text-gray-900">Édition de Salle</h1>
          <p class="text-gray-500 mt-1">Gérez les détails, la tarification et les médias de votre espace.</p>
        </div>
        <button class="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          Voir la fiche
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

        <div class="xl:col-span-2 space-y-6">
          <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="bg-blue-100 text-[#1da1f2] p-1.5 rounded-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
                Informations Générales
              </h2>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Nom de la salle</label>
                  <input type="text" formControlName="name" placeholder="Ex: Salle de conférence Mercure" class="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#1da1f2] focus:border-transparent outline-none transition">
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea formControlName="description" rows="3" placeholder="Description de l'espace..." class="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#1da1f2] focus:border-transparent outline-none transition"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
                    <select formControlName="category" class="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#1da1f2] bg-white outline-none">
                      <option value="MEETING">Réunion</option>
                      <option value="STUDIO">Studio</option>
                      <option value="EVENT">Événementiel</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Surface (m²)</label>
                    <input type="number" formControlName="surfaceArea" class="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#1da1f2] outline-none">
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="bg-blue-100 text-[#1da1f2] p-1.5 rounded-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
                Capacité et Tarification
              </h2>

              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Capacité max.</label>
                  <div class="relative">
                    <input type="number" formControlName="capacity" class="w-full border border-gray-200 rounded-lg p-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-[#1da1f2]">
                    <span class="absolute right-3 top-3 text-gray-400">👥</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Tarif Horaire</label>
                  <div class="relative">
                    <input type="number" formControlName="hourlyPrice" class="w-full border border-gray-200 rounded-lg p-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-[#1da1f2]">
                    <span class="absolute right-3 top-3 text-gray-500 font-medium">€</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Demi-journée</label>
                  <div class="relative">
                    <input type="number" formControlName="halfDayPrice" class="w-full border border-gray-200 rounded-lg p-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-[#1da1f2]">
                    <span class="absolute right-3 top-3 text-gray-500 font-medium">€</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Journée</label>
                  <div class="relative">
                    <input type="number" formControlName="fullDayPrice" class="w-full border border-gray-200 rounded-lg p-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-[#1da1f2]">
                    <span class="absolute right-3 top-3 text-gray-500 font-medium">€</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="bg-blue-100 text-[#1da1f2] p-1.5 rounded-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></span>
                Galerie Photos
              </h2>

              <div
                class="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-10 text-center cursor-pointer hover:bg-blue-50 transition"
                (click)="fileInput.click()"
                (dragover)="$event.preventDefault()"
                (drop)="onFileDrop($event)">
                <input #fileInput type="file" multiple accept="image/*" class="hidden" (change)="onFileSelected($event)">
                <div class="bg-white w-12 h-12 rounded-full shadow flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-[#1da1f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <p class="text-gray-900 font-bold">Glissez vos photos ici</p>
                <p class="text-sm text-[#1da1f2]">ou cliquez pour parcourir vos fichiers</p>
                <p class="text-xs text-gray-400 mt-2">JPG, PNG jusqu'à 5Mo</p>
              </div>

              @if (selectedFiles().length > 0) {
                <div class="flex gap-4 mt-6 overflow-x-auto pb-2">
                  @for (file of selectedFiles(); track file.name; let i = $index) {
                    <div class="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img [src]="getFileUrl(file)" class="w-full h-full object-cover">
                      @if (i === 0) {
                        <span class="absolute top-1 left-1 bg-[#1da1f2] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Principale</span>
                      }
                      <button type="button" (click)="removeFile(i)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">×</button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <span class="text-sm text-gray-400">Dernière sauvegarde automatique : 14:02</span>
              <div class="flex gap-3">
                <button type="button" class="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">Annuler</button>
                <button type="submit" [disabled]="!roomForm.valid || isSubmitting()" class="px-6 py-2.5 bg-[#0b648f] hover:bg-[#084a6b] text-white font-bold rounded-lg shadow-md transition disabled:opacity-50">
                  {{ isSubmitting() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                </button>
              </div>
            </div>

          </form>
        </div>

        <div class="xl:col-span-1">
          <div class="bg-gray-100 rounded-3xl p-4 border-[6px] border-gray-200 shadow-xl sticky top-8">
            <div class="flex justify-between items-center mb-4 px-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
              </div>
              <div class="bg-white px-3 py-1 rounded text-[10px] text-gray-400 font-mono w-48 truncate">
                https://sallefacile.com/salles/mercure
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <div class="h-40 bg-gray-200 relative">
                @if (selectedFiles().length > 0) {
                  <img [src]="getFileUrl(selectedFiles()[0])" class="w-full h-full object-cover">
                }
                <span class="absolute top-3 left-3 bg-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider text-gray-800">{{ roomForm.value.category || 'RÉUNION' }}</span>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ roomForm.value.name || 'Nom de la salle' }}</h3>
                  <span class="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">★ 4.9</span>
                </div>
                <p class="text-xs text-gray-500 mb-3 flex gap-3">
                  <span>👥 {{ roomForm.value.capacity || '0' }} pers.</span>
                  <span>📏 {{ roomForm.value.surfaceArea || '0' }} m²</span>
                </p>
                <p class="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                  {{ roomForm.value.description || 'Description de votre salle apparaîtra ici...' }}
                </p>
                <div class="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div>
                    <span class="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">À PARTIR DE</span>
                    <span class="font-bold text-[#0b648f] text-lg">{{ roomForm.value.hourlyPrice || '0' }}€ <span class="text-xs text-gray-500 font-normal">/h</span></span>
                  </div>
                  <button class="bg-[#0b648f] text-white text-sm font-bold px-4 py-2 rounded-lg">Réserver</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminRoomEditPageComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // État local avec les Signals
  public selectedFiles = signal<File[]>([]);
  public isSubmitting = signal(false);

  // Formulaire Réactif
  public roomForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    category: ['MEETING', Validators.required],
    surfaceArea: [35, [Validators.required, Validators.min(1)]],
    capacity: [12, [Validators.required, Validators.min(1)]],
    hourlyPrice: [45, [Validators.required, Validators.min(0)]],
    halfDayPrice: [160, [Validators.required, Validators.min(0)]],
    fullDayPrice: [300, [Validators.required, Validators.min(0)]],
  });

  // Gère la sélection classique de fichiers
  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles.update(files => [...files, ...Array.from(event.target.files as FileList)]);
    }
  }

  // Gère le Drag & Drop
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.selectedFiles.update(files => [...files, ...Array.from(event.dataTransfer!.files)]);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  // Utilitaire pour afficher un aperçu local de l'image sélectionnée
  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  onSubmit() {
    if (this.roomForm.invalid) return;

    this.isSubmitting.set(true);

    // Utilisation de FormData car nous envoyons des fichiers (images)
    const formData = new FormData();
    const formValues = this.roomForm.value;

    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key as keyof typeof formValues] as string);
    });

    // Ajout des fichiers au payload
    this.selectedFiles().forEach(file => {
      formData.append('images', file);
    });

    // Appel HTTP vers notre API NestJS configurée avec Multer
    this.http.post('http://localhost:3000/admin/rooms', formData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        alert('Salle créée avec succès !');
        // Redirection logique ici
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error(err);
        alert('Erreur lors de la création');
      }
    });
  }
}
