import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RoomAvailabilityCalendarComponent } from '../../shared/ui/room-availability-calendar/room-availability-calendar.component';

@Component({
  selector: 'app-admin-room-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RoomAvailabilityCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50 min-h-screen font-sans">

      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/admin/salles" class="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1">Dashboard / Salles / Édition</div>
          <h1 class="text-3xl font-extrabold text-gray-900">
            {{ isEditMode() ? 'Modifier la salle' : 'Nouvelle Salle' }}
          </h1>
        </div>
      </div>

      <form [formGroup]="roomForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="col-span-1 lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Informations Générales</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nom de l'espace</label>
                <input type="text" formControlName="name" placeholder="Ex: Salle de Conférence Alpha"
                       class="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#1da1f2] focus:ring-1 focus:ring-[#1da1f2] transition">
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Description détaillée</label>
                <textarea formControlName="description" rows="4" placeholder="Décrivez les atouts de cette salle..."
                          class="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#1da1f2] focus:ring-1 focus:ring-[#1da1f2] transition resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Capacité (personnes)</label>
                  <input type="number" formControlName="capacity" min="1"
                         class="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#1da1f2] focus:ring-1 focus:ring-[#1da1f2] transition">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Catégorie</label>
                  <select formControlName="category" class="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#1da1f2] focus:ring-1 focus:ring-[#1da1f2] transition bg-white">
                    <option value="MEETING">Réunion</option>
                    <option value="STUDIO">Studio de création</option>
                    <option value="EVENT">Événementiel</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Galerie d'images</h2>

            <div
              class="border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200"
              [ngClass]="isDragging() ? 'border-[#1da1f2] bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)">

              <div class="text-4xl mb-3">📸</div>
              <p class="text-sm text-gray-600 font-semibold mb-1">Glissez et déposez vos photos ici</p>
              <p class="text-xs text-gray-400 mb-4">JPG, PNG (Max 5MB)</p>

              <input type="file" #fileInput multiple accept="image/*" class="hidden" (change)="onFileSelected($event)">
              <button type="button" (click)="fileInput.click()" class="bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-lg hover:bg-gray-50 shadow-sm transition">
                Parcourir les fichiers
              </button>
            </div>

            @if (imagePreviews().length > 0) {
              <div class="grid grid-cols-4 gap-4 mt-6">
                @for (preview of imagePreviews(); track $index) {
                  <div class="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                    <img [src]="preview" class="w-full h-full object-cover">
                    <button type="button" (click)="removeImage($index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md">
                      ✕
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- CALENDRIER DE DISPONIBILITÉ (Seulement en édition) -->
          @if (isEditMode() && roomId()) {
            <div class="mt-6">
               <h2 class="text-lg font-bold text-gray-900 mb-4">Gestion des disponibilités</h2>
               <p class="text-sm text-gray-500 mb-4">Sélectionnez des créneaux pour les bloquer (Maintenance, Fermeture...).</p>
               <app-room-availability-calendar
                  [roomId]="roomId()!"
                  [isAdmin]="true"
               ></app-room-availability-calendar>
            </div>
          } @else {
             <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center mt-6">
                <p class="text-blue-800 font-semibold">Gestion des disponibilités</p>
                <p class="text-sm text-blue-600">Vous pourrez accéder au calendrier et bloquer des créneaux une fois la salle créée.</p>
             </div>
          }
        </div>

        <div class="col-span-1 space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Tarification</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Prix à l'heure (€)</label>
                <input type="number" formControlName="hourlyPrice" min="0"
                       class="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#1da1f2] transition font-bold text-[#0b648f]">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Prix Journée complète (€)</label>
                <input type="number" formControlName="fullDayPrice" min="0"
                       class="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#1da1f2] transition font-bold text-[#0b648f]">
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Publication</h2>

            <label class="flex items-center cursor-pointer mb-6">
              <div class="relative">
                <input type="checkbox" formControlName="isActive" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1da1f2]"></div>
              </div>
              <span class="ml-3 text-sm font-bold text-gray-700">Rendre la salle visible au public</span>
            </label>

            <button type="submit" [disabled]="roomForm.invalid || isLoading()"
                    class="w-full bg-[#1da1f2] text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
              @if (isLoading()) {
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              } @else {
                {{ isEditMode() ? 'Enregistrer les modifications' : 'Créer la salle' }}
              }
            </button>
          </div>
        </div>

      </form>
    </div>
  `
})
export class AdminRoomFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // État local
  public isEditMode = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public roomId = signal<string | null>(null);

  // État du Drag & Drop
  public isDragging = signal<boolean>(false);
  public selectedFiles = signal<File[]>([]);
  public imagePreviews = signal<string[]>([]);

  public roomForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
    category: ['MEETING', Validators.required],
    hourlyPrice: [0, [Validators.required, Validators.min(0)]],
    fullDayPrice: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.isEditMode.set(true);
      this.roomId.set(id);
      this.loadRoomData(id);
    }
  }

  loadRoomData(id: string) {
    this.http.get<any>(`http://localhost:3000/rooms/${id}`).subscribe({
      next: (room) => {
        this.roomForm.patchValue(room);
        // Si la salle a déjà des images sur le serveur, on les ajoute à l'aperçu
        if (room.images) {
          this.imagePreviews.set(room.images.map((img: any) => img.url));
        }
      }
    });
  }

  // ==========================================
  // 📸 LOGIQUE DRAG & DROP
  // ==========================================

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Empêche le navigateur d'ouvrir le fichier
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]) {
    // Filtrer pour ne garder que les images
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    // Ajout aux fichiers à envoyer
    this.selectedFiles.update(current => [...current, ...validFiles]);

    // Création des URL d'aperçu pour le navigateur
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    this.imagePreviews.update(current => [...current, ...newPreviews]);
  }

  removeImage(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  // ==========================================
  // 🚀 SOUMISSION DU FORMULAIRE
  // ==========================================

  onSubmit() {
    if (this.roomForm.invalid) return;
    this.isLoading.set(true);

    // Utilisation de FormData car nous envoyons des fichiers physiques !
    const formData = new FormData();
    const formValues = this.roomForm.value;

    // Ajout des champs textes
    Object.keys(formValues).forEach(key => {
      formData.append(key, (formValues as any)[key]);
    });

    // Ajout des fichiers images
    this.selectedFiles().forEach(file => {
      formData.append('images', file);
    });

    const request = this.isEditMode()
      ? this.http.patch(`http://localhost:3000/rooms/${this.roomId()}`, formData)
      : this.http.post('http://localhost:3000/rooms', formData);

    request.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/salles']);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert("Erreur lors de la sauvegarde.");
        console.error(err);
      }
    });
  }
}
