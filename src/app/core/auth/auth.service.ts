import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TournamentStore } from '../services/tournament-store.service';
import { environment } from '../../../environments/environment';
import { LoginResp } from './types';
import { NotificationService } from '../notifications/notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(TournamentStore);
  private notifications = inject(NotificationService);
  private readonly adminBase = `${environment.apiUrl}/admin/auth`;
  private readonly authBase = `${environment.apiUrl}/auth`;

  private avatarSubject = new BehaviorSubject<string | null>(
    sessionStorage.getItem('avatar')
  );
  avatar$ = this.avatarSubject.asObservable();

  private roleSubject = new BehaviorSubject<
    'ADMIN' | 'USER' | 'GUEST' | 'NONE'
  >(this.readRoleFromToken() ?? 'NONE');
  role$ = this.roleSubject.asObservable();
  isAdmin$ = this.role$.pipe(map((r) => r === 'ADMIN'));

  /**
   * Logowanie poprzez Google (OAuth)
   * Zwracanie tokenów dostępowych i informacji o użytkowniku
   */
  loginWithGoogle(idToken: string): Observable<LoginResp> {
    return this.http.post<LoginResp>(`${this.adminBase}/google/verify`, {
      idToken,
    });
  }

  /**
   * Generowanie i zapisywanie identyfikatora urządzenia
   * Używane w logowaniu gościa
   */
  private ensureDeviceId(): string {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'web-' + Math.random().toString(36).substring(2);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }

  /** Logowanie w trybie gościa */
  loginAsGuest(): Observable<LoginResp> {
    const deviceId = this.ensureDeviceId();
    return this.http.post<LoginResp>(`${this.authBase}/guest`, { deviceId });
  }

  /**
   * Odświeżanie tokenu dostępu access tokenu przy użyciu refresh tokenu
   * Zwracanie nowego access tokenu i automatyczne zapisanie go w sessionStorage
   */
  refreshAccessToken(): Observable<{ accessToken: string }> {
    const rt = sessionStorage.getItem('rt');
    return this.http
      .post<{ accessToken: string }>(`${this.authBase}/refresh`, {
        refreshToken: rt,
      })
      .pipe(
        tap(({ accessToken }) => {
          if (accessToken) {
            sessionStorage.setItem('at', accessToken);
          }
        })
      );
  }

  /**
   * Zapisywanie sesji użytkownika:
   * - access token
   * - opcjonalnie awatar
   * - opcjonalnie refresh token
   */
  saveSession(
    accessToken: string,
    avatar?: string,
    refreshToken?: string
  ): void {
    sessionStorage.setItem('at', accessToken);
    if (refreshToken) {
      sessionStorage.setItem('rt', refreshToken);
    }
    if (avatar) {
      sessionStorage.setItem('avatar', avatar);
      this.avatarSubject.next(avatar);
    }
    this.roleSubject.next(this.readRoleFromToken(accessToken) ?? 'USER');
  }

  /** Wylogowywanie użytkownika i czyszczenie sesji */
  logout(): void {
    sessionStorage.removeItem('at');
    sessionStorage.removeItem('rt');
    sessionStorage.removeItem('avatar');
    sessionStorage.removeItem('welcome_shown');
    this.notifications.clear();
    this.avatarSubject.next(null);
    this.roleSubject.next('NONE');
    this.store.clearTournament();
  }

  /** Zapisywanie lub czyszczenie awatara użytkownika */
  setAvatar(avatar: string | null) {
    if (avatar) {
      sessionStorage.setItem('avatar', avatar);
    } else {
      sessionStorage.removeItem('avatar');
    }
    this.avatarSubject.next(avatar);
  }

  /** Pobieranie awatara użytkownika */
  getAvatar(): string | null {
    return sessionStorage.getItem('avatar');
  }

  /** Odczytywanie roli z JWT (ADMIN / USER / GUEST) */
  private readRoleFromToken(token?: string): 'ADMIN' | 'USER' | 'GUEST' | null {
    try {
      const t = token ?? sessionStorage.getItem('at');
      if (!t) return null;
      const [, b64] = t.split('.');
      const payload = JSON.parse(
        atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
      );
      return payload?.role ?? null;
    } catch {
      return null;
    }
  }

  /** Sprawdzanie czy token JWT jest ważny, czy nie wygasł */
  isTokenValid(token?: string): boolean {
    const t = token ?? sessionStorage.getItem('at');
    if (!t) return false;
    try {
      const [, b64] = t.split('.');
      const payload = JSON.parse(
        atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
      );
      const exp = payload?.exp as number | undefined;
      if (!exp) {
        return true;
      }
      const now = Math.floor(Date.now() / 1000);
      return exp > now;
    } catch {
      return false;
    }
  }

  /** Pobieranie podstawowych danych użytkownika z tokenu */
  getUserInfo(): {
    email: string | null;
    name: string | null;
    role: 'ADMIN' | 'USER' | 'GUEST' | 'NONE';
  } {
    const t = this.getToken();
    if (!t) {
      return { email: null, name: null, role: 'NONE' };
    }

    try {
      const [, b64] = t.split('.');
      const payload = JSON.parse(
        atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
      );

      const email: string | null =
        payload?.email ?? payload?.upn ?? payload?.sub ?? null;

      const name: string | null =
        payload?.name ??
        payload?.given_name ??
        payload?.preferred_username ??
        null;

      const role = (payload?.role as 'ADMIN' | 'USER' | 'GUEST') ?? 'USER';

      return { email, name, role };
    } catch {
      return { email: null, name: null, role: 'NONE' };
    }
  }

  /** Sprawdzanie czy użytkownik jest zalogowany */
  isLoggedIn(): boolean {
    const t = sessionStorage.getItem('at');
    return !!t && this.isTokenValid(t);
  }

  /** Pobieranie tokenu użytkownika - access tokenu */
  getToken(): string | null {
    return sessionStorage.getItem('at');
  }
}
