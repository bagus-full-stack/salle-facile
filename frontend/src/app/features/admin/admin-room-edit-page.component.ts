import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { RoomService } from '../../core/services/room.service';

@Component({
  selector: 'app-admin-room-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 bg-gray-50/50 min-h-screen font-sans">

      <div class="flex justify-between items-center mb-8">
        <div>
          <div class="text-sm text-[#1da1f2] font-semibold mb-1 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path></svg>
            <a routerLink="/admin/dashboard" class="hover:underline">Dashboard</a> /
            <a routerLink="/admin/salles" class="hover:underline">Salles</a> /
            <span>{{ isEditMode() ? 'Édition' : 'Création' }}</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-900">
            {{ isEditMode() ? 'Édition de Salle' : 'Ajouter une nouvelle salle' }}
          </h1>
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

            <!-- ============================== -->
            <!-- 1. INFORMATIONS GÉNÉRALES -->
            <!-- ============================== -->
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

            <!-- ============================== -->
            <!-- 2. CAPACITÉ ET TARIFICATION -->
            <!-- ============================== -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="bg-blue-100 text-[#1da1f2] p-1.5 rounded-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
                Capacité et Tarification
              </h2>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            <!-- ============================== -->
            <!-- 3. GALERIE PHOTOS -->
            <!-- ============================== -->
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

              @if (selectedFiles().length > 0 || existingImages().length > 0) {
                <div class="flex gap-4 mt-6 overflow-x-auto pb-2">
                  <!-- Existing Images -->
                  @for (img of existingImages(); track img.id) {
                    <div class="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0 group">
                       <img [src]="img.url" class="w-full h-full object-cover">
                       <button type="button" (click)="deleteExistingImage(img.id)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md transform scale-0 group-hover:scale-100 transition">×</button>
                    </div>
                  }
                  <!-- New Files -->
                  @for (file of selectedFiles(); track file.name; let i = $index) {
                    <div class="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img [src]="getFileUrl(file)" class="w-full h-full object-cover">
                      <!-- Badge Principale: si pas d'image existante, la première nouvelle est principale -->
                      @if (i === 0 && existingImages().length === 0) {
                        <span class="absolute top-1 left-1 bg-[#1da1f2] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Principale</span>
                      }
                      <button type="button" (click)="removeFile(i)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">×</button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- ============================== -->
            <!-- 4. ÉQUIPEMENTS & SERVICES -->
            <!-- ============================== -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="bg-blue-100 text-[#1da1f2] p-1.5 rounded-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></span>
                Équipements & Services
              </h2>

              <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                @if (equipmentsList().length > 0) {
                  @for (eq of equipmentsList(); track eq.id) {
                    <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition group">
                      <div class="relative flex items-center">
                        <input type="checkbox"
                               [checked]="selectedEquipments().includes(eq.id)"
                               (change)="toggleEquipment(eq.id)"
                               class="peer w-5 h-5 border-2 border-gray-300 rounded text-[#1da1f2] focus:ring-[#1da1f2] focus:ring-offset-0 disabled:opacity-50">
                      </div>
                      <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ eq.name }}</span>
                    </label>
                  }
                } @else {
                  <div class="col-span-2 lg:col-span-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                    <p class="text-sm font-medium">⚠️ Aucun équipement disponible</p>
                    <p class="text-xs text-yellow-700 mt-1">Veuillez contacter l'administrateur pour ajouter des équipements.</p>
                  </div>
                }
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <span class="text-sm text-gray-400">Dernière sauvegarde automatique : 14:02</span>
              <div class="flex gap-3">
                <button type="button" routerLink="/admin/salles" class="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">Annuler</button>



                <button type="submit" [disabled]="!roomForm.valid || isSubmitting()" class="px-6 py-2.5 bg-[#0b648f] hover:bg-[#084a6b] text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2">
                  @if (isSubmitting()) {
                    <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  }
                  {{ isEditMode() ? 'Mettre à jour' : 'Enregistrer les modifications' }}
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
                https://sallefacile.com/salles/{{ roomForm.value.name | slice:0:15 }}...
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <div class="h-40 bg-gray-200 relative">
                @if (existingImages().length > 0) {
                     <img [src]="existingImages()[0].url"
                          class="w-full h-full object-cover"
                          (error)="onImageError($event)">
                } @else if (selectedFiles().length > 0) {
                  <img [src]="getFileUrl(selectedFiles()[0])"
                       class="w-full h-full object-cover"
                       (error)="onImageError($event)">
                }
                <span class="absolute top-3 left-3 bg-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider text-gray-800">{{ roomForm.value.category || 'TYPE' }}</span>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ roomForm.value.name || 'Nom de la salle' }}</h3>
                  <span class="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">★ New</span>
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

            <div class="mt-4 p-4 bg-white rounded-xl shadow-sm">
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Équipements inclus</h4>
                <div class="flex flex-wrap gap-2">
                    @for(id of selectedEquipments(); track id) {
                        @if(getEquipmentName(id); as name) {
                            <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{{ name }}</span>
                        }
                    }
                    @if(selectedEquipments().length === 0) {
                        <span class="text-[10px] text-gray-400 italic">Aucun équipement sélectionné</span>
                    }
                </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminRoomEditPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // État local avec les Signals
  public isEditMode = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public roomId = signal<string | null>(null);

  public selectedFiles = signal<File[]>([]);
  public existingImages = signal<{ id: string, url: string }[]>([]);

  public equipmentsList = signal<{ id: string, name: string }[]>([]);

  public selectedEquipments = signal<string[]>([]);

  // Formulaire Réactif
  public roomForm = this.fb.group({
    name: ['', { validators: Validators.required, nonNullable: true }],
    description: ['', { validators: Validators.required, nonNullable: true }],
    category: ['MEETING', { validators: Validators.required, nonNullable: true }],
    surfaceArea: [null as number | null, [Validators.required, Validators.min(1)]],
    capacity: [null as number | null, [Validators.required, Validators.min(1)]],
    hourlyPrice: [null as number | null, [Validators.required, Validators.min(0)]],
    halfDayPrice: [null as number | null, [Validators.required, Validators.min(0)]],
    fullDayPrice: [null as number | null, [Validators.required, Validators.min(0)]],
    isActive: [true, { nonNullable: true }]
  });

  ngOnInit() {
    // Charger les équipements depuis le backend
    this.roomService.getEquipments().subscribe({
      next: (eqs) => {
        console.log('✅ Équipements chargés:', eqs);
        if (eqs && eqs.length > 0) {
          this.equipmentsList.set(eqs);
        } else {
          console.warn('⚠️ Aucun équipement retourné du serveur');
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des équipements:', err);
        // Fallback: Utiliser les équipements par défaut
        this.setDefaultEquipments();
      }
    });

    // Charger les données si c'est une édition
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.isEditMode.set(true);
      this.roomId.set(id);
      this.loadRoomData(id);
    }
  }

  private setDefaultEquipments() {
    console.log('ℹ️ Utilisation des équipements par défaut');
    this.equipmentsList.set([
      { id: '1', name: 'Wifi Haut Débit' },
      { id: '2', name: 'Vidéoprojecteur' },
      { id: '3', name: 'Climatisation' },
      { id: '4', name: 'Tableau blanc' },
      { id: '5', name: 'Machine à café' },
      { id: '6', name: 'Accès PMR' },
      { id: '7', name: 'Imprimante / Scanner' }
    ]);
  }

  loadRoomData(id: string) {
    console.log('🔄 Chargement des données de la salle:', id);
    this.roomService.loadRoomDetails(id);
    setTimeout(() => {
        const room = this.roomService.currentRoom();
        if (room) {
            console.log('✅ Salle chargée:', room);
            console.log('   - Images:', room.images.length);
            this.roomForm.patchValue({
                name: room.name,
                description: room.description,
                category: room.category,
                capacity: room.capacity,
                hourlyPrice: room.hourlyPrice,
                halfDayPrice: room.halfDayPrice,
                fullDayPrice: room.fullDayPrice,
                surfaceArea: (room as any).surfaceArea
            });
            // Construire les URLs complètes pour les images existantes
            const imagesWithFullUrl = room.images.map(img => {
              const fullUrl = this.getFullImageUrl(img.url);
              console.log(`   - Image URL: ${img.url} → ${fullUrl}`);
              return {
                id: img.id,
                url: fullUrl
              };
            });
            this.existingImages.set(imagesWithFullUrl);
            this.selectedEquipments.set(room.equipments.map(e => e.id));
            console.log('✅ Images chargées et URL converties');
        } else {
            console.warn('⚠️ Aucune salle trouvée');
        }
    }, 1000);
  }

  // Helper pour construire l'URL complète d'une image
  private getFullImageUrl(url: string): string {
    // Si l'URL est déjà absolue (commence par http), la retourner telle quelle
    if (url.startsWith('http')) {
      return url;
    }
    // Sinon, construire l'URL complète avec le domaine du backend
    return `http://localhost:3000${url}`;
  }

  // Gérer les erreurs de chargement d'images
  onImageError(event: any) {
    console.error('❌ Erreur de chargement d\'image:', event);
    console.error('   URL tentée:', event.target.src);
  }

  // Gère la sélection classique de fichiers
  onFileSelected(event: any) {
    if (event.target.files) {
      this.handleFiles(event.target.files);
    }
  }

  // Gère le Drag & Drop
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  handleFiles(fileList: FileList) {
    const newFiles = Array.from(fileList);
    this.selectedFiles.update(files => [...files, ...newFiles]);
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  deleteExistingImage(imageId: string) {
      if(confirm('Supprimer cette image ?')) {
          this.roomService.deleteRoomImage(imageId).subscribe(() => {
              this.existingImages.update(imgs => imgs.filter(img => img.id !== imageId));
          });
      }
  }

  // Utilitaire pour afficher un aperçu local de l'image sélectionnée
  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // LOGIQUE EQUIPEMENTS
  toggleEquipment(id: string) {
    this.selectedEquipments.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(i => i !== id);
      } else {
        return [...ids, id];
      }
    });
  }

  getEquipmentName(id: string): string {
      return this.equipmentsList().find(e => e.id === id)?.name || id;
  }



  onSubmit() {
    if (this.roomForm.invalid) {
      console.warn('❌ Formulaire invalide');
      Object.keys(this.roomForm.controls).forEach(key => {
        const control = this.roomForm.get(key);
        if (control?.invalid) {
          console.warn(`  - ${key}:`, control.errors);
        }
      });
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData();

    // Ajouter les champs du formulaire
    Object.keys(this.roomForm.controls).forEach(key => {
      const control = this.roomForm.get(key);
      const value = control?.value;

      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    // Ajouter les équipements
    formData.append('equipments', JSON.stringify(this.selectedEquipments()));

    // Ajouter les images
    this.selectedFiles().forEach(file => {
      formData.append('images', file);
    });

    console.log('📤 Envoi du formulaire...');
    console.log('  - Fichiers:', this.selectedFiles().length);
    console.log('  - Équipements:', this.selectedEquipments().length);

    if (this.isEditMode() && this.roomId()) {
      console.log('🔄 Mode édition, ID:', this.roomId());
      this.roomService.updateRoom(this.roomId()!, formData).subscribe({
        next: (room) => {
          console.log('✅ Salle mise à jour:', room);
          this.isSubmitting.set(false);
          this.router.navigate(['/admin/salles']);
        },
        error: (err) => {
          console.error('❌ Erreur lors de la mise à jour:', err);
          this.isSubmitting.set(false);
          const errorMsg = err.error?.message || err.message || 'Erreur inconnue';
          alert(`Erreur lors de la mise à jour: ${errorMsg}`);
        }
      });
    } else {
      console.log('✨ Mode création');
      this.roomService.createRoom(formData).subscribe({
        next: (room) => {
          console.log('✅ Salle créée:', room);
          this.isSubmitting.set(false);
          // Rediriger avec l'ID de la nouvelle salle pour afficher les images
          this.router.navigate(['/admin/salles/edition', room.id]);
        },
        error: (err) => {
          console.error('❌ Erreur lors de la création:', err);
          this.isSubmitting.set(false);
          const errorMsg = err.error?.message || err.message || 'Erreur inconnue';
          alert(`Erreur lors de la création: ${errorMsg}`);
        }
      });
    }
  }
}
