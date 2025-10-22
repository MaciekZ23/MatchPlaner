import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TournamentStore } from '../services/tournament-store.service';
import { environment } from '../../../environments/environment';
import { LoginResp } from './types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(TournamentStore);
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

  // loginWithGoogle(
  //   idToken: string
  // ): Observable<{ token: string; user?: { avatarUrl?: string } }> {
  //   return this.http.post<{ token: string; user?: { avatarUrl?: string } }>(
  //     `${this.adminBase}/google/verify`,
  //     { idToken }
  //   );
  // }

  loginWithGoogle(idToken: string): Observable<LoginResp> {
    return this.http.post<LoginResp>(`${this.adminBase}/google/verify`, {
      idToken,
    });
  }

  private ensureDeviceId(): string {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'web-' + Math.random().toString(36).substring(2);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }

  // loginAsGuest(): Observable<{ token: string; guestId?: string }> {
  //   const deviceId = this.ensureDeviceId();
  //   return this.http.post<{ token: string; guestId?: string }>(
  //     `${this.authBase}/guest`,
  //     { deviceId }
  //   );
  // }

  loginAsGuest(): Observable<LoginResp> {
    const deviceId = this.ensureDeviceId();
    return this.http.post<LoginResp>(`${this.authBase}/guest`, { deviceId });
  }

  refreshAccessToken(): Observable<{ accessToken: string }> {
    const rt = sessionStorage.getItem('rt');
    return this.http
      .post<{ accessToken: string }>(`${this.authBase}/refresh`, {
        refreshToken: rt,
      })
      .pipe(
        tap(({ accessToken }) => {
          if (accessToken) sessionStorage.setItem('at', accessToken);
        })
      );
  }

  // saveSession(token: string, avatar?: string): void {
  //   localStorage.setItem('token', token);
  //   if (avatar) {
  //     localStorage.setItem('avatar', avatar);
  //     this.avatarSubject.next(avatar);
  //   }
  //   this.roleSubject.next(this.readRoleFromToken(token) ?? 'USER');
  // }

  saveSession(
    accessToken: string,
    avatar?: string,
    refreshToken?: string
  ): void {
    sessionStorage.setItem('at', accessToken);
    if (refreshToken) sessionStorage.setItem('rt', refreshToken);

    if (avatar) {
      sessionStorage.setItem('avatar', avatar);
      this.avatarSubject.next(avatar);
    }
    this.roleSubject.next(this.readRoleFromToken(accessToken) ?? 'USER');
  }

  // logout(): void {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('avatar');
  //   this.avatarSubject.next(null);
  //   this.roleSubject.next('NONE');
  //   this.store.clearTournament();
  // }

  logout(): void {
    sessionStorage.removeItem('at');
    sessionStorage.removeItem('rt');
    sessionStorage.removeItem('avatar');
    this.avatarSubject.next(null);
    this.roleSubject.next('NONE');
    this.store.clearTournament();
  }

  setAvatar(avatar: string | null) {
    if (avatar) {
      sessionStorage.setItem('avatar', avatar);
    } else {
      sessionStorage.removeItem('avatar');
    }
    this.avatarSubject.next(avatar);
  }

  getAvatar(): string | null {
    return sessionStorage.getItem('avatar');
  }

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

  isTokenValid(token?: string): boolean {
    const t = token ?? sessionStorage.getItem('at');
    if (!t) return false;
    try {
      const [, b64] = t.split('.');
      const payload = JSON.parse(
        atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
      );
      const exp = payload?.exp as number | undefined; // sekundy od epoki
      if (!exp) return true; // brak exp -> traktujemy jako ważny (opcjonalnie: false)
      const now = Math.floor(Date.now() / 1000);
      return exp > now;
    } catch {
      return false;
    }
  }

  getUserInfo(): {
    email: string | null;
    name: string | null;
    role: 'ADMIN' | 'USER' | 'GUEST' | 'NONE';
  } {
    const t = this.getToken();
    if (!t) return { email: null, name: null, role: 'NONE' };

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

  isLoggedIn(): boolean {
    const t = sessionStorage.getItem('at');
    return !!t && this.isTokenValid(t);
  }

  getToken(): string | null {
    return sessionStorage.getItem('at');
  }
}
