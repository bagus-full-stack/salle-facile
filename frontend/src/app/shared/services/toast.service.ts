import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);

  toastList$ = this.toasts$.asObservable();

  success(message: string, duration = 5000) {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration = 7000) {
    this.addToast(message, 'error', duration);
  }

  warning(message: string, duration = 6000) {
    this.addToast(message, 'warning', duration);
  }

  info(message: string, duration = 5000) {
    this.addToast(message, 'info', duration);
  }

  private addToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number) {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    console.log(`[ToastService] ${type.toUpperCase()}: ${message}`);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  removeToast(id: string) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts$.next([]);
  }
}

