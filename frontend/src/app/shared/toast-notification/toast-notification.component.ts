import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 pointer-events-none">
      <div
        *ngFor="let toast of toasts()"
        class="mb-3 pointer-events-auto animate-fade-in-toast"
      >
        <div
          [ngClass]="{
            'bg-green-500': toast.type === 'success',
            'bg-red-500': toast.type === 'error',
            'bg-yellow-500': toast.type === 'warning',
            'bg-blue-500': toast.type === 'info'
          }"
          class="text-white px-4 py-3 rounded shadow-lg flex items-center gap-3"
        >
          <!-- Icon -->
          <span class="text-lg flex-shrink-0">
            <span *ngIf="toast.type === 'success'">✅</span>
            <span *ngIf="toast.type === 'error'">❌</span>
            <span *ngIf="toast.type === 'warning'">⚠️</span>
            <span *ngIf="toast.type === 'info'">ℹ️</span>
          </span>

          <!-- Message -->
          <span class="flex-grow">{{ toast.message }}</span>

          <!-- Close Button -->
          <button
            (click)="removeToast(toast.id)"
            class="ml-2 text-lg cursor-pointer hover:opacity-70 flex-shrink-0"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInToast {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in-toast {
      animation: fadeInToast 300ms ease-in;
    }
  `]
})
export class ToastNotificationComponent implements OnInit {
  private toastService = inject(ToastService);
  toasts = signal<Toast[]>([]);

  ngOnInit() {
    // Écouter les toasts du service
    this.toastService.toastList$.subscribe(toasts => {
      this.toasts.set(toasts);
    });
  }

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }
}


