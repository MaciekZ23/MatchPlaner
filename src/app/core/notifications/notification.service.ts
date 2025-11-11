import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../types';
import { AppNotification } from '../models/notifications.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private STORAGE_KEY = 'notifications';
  private list$ = new BehaviorSubject<AppNotification[]>(this.load());

  /** Strumień zawierający aktualną listę powiadomień */
  notifications$ = this.list$.asObservable();

  /**
   * Dodawanie nowego powiadomienia do listy + zapis w localStorage
   * Maksymalnie przechowywanych jest 20 powiadomień
   */
  add(message: string, type: 'info' | 'success' | 'warning' = 'info') {
    const n: AppNotification = {
      id: crypto.randomUUID?.() ?? String(Math.random()),
      message,
      type,
      createdAt: Date.now(),
    };
    const next = [n, ...this.list$.value].slice(0, 20);
    this.list$.next(next);
    this.save(next);
  }

  /** Dodawanie jednorazowego powitania po zalogowaniu, emitowane tylko raz na sesję */
  addWelcome(role: UserRole, name?: string) {
    if (sessionStorage.getItem('welcome_shown') === '1') return;
    const who =
      role === 'GUEST'
        ? 'Gość'
        : role === 'ADMIN'
        ? name
          ? `${name} (Administrator)`
          : 'Administrator'
        : name ?? 'Użytkownik';
    this.add(
      `Witamy w serwisie, ${who}! Zalogowałeś(-aś) się pomyślnie.`,
      'success'
    );
    sessionStorage.setItem('welcome_shown', '1');
  }

  /** Czyszczenie wszystkich powiadomień (lista + localStorage) */
  clear() {
    this.list$.next([]);
    this.save([]);
  }

  /** Ładowanie powiadomień z localStorage */
  private load(): AppNotification[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /** Zapisywanie powiadomień do localStorage */
  private save(list: AppNotification[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }
}
