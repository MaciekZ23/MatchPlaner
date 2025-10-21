import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TournamentStore } from '../services/tournament-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(TournamentStore);
  private readonly backendUrl = '/api/v1/admin/auth';

  private avatarSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('avatar')
  );
  avatar$ = this.avatarSubject.asObservable();

  private roleSubject = new BehaviorSubject<
    'ADMIN' | 'USER' | 'GUEST' | 'NONE'
  >(this.readRoleFromToken() ?? 'NONE');
  role$ = this.roleSubject.asObservable();
  isAdmin$ = this.role$.pipe(map((r) => r === 'ADMIN'));

  loginWithGoogle(
    idToken: string
  ): Observable<{ token: string; user?: { avatarUrl?: string } }> {
    return this.http.post<{ token: string; user?: { avatarUrl?: string } }>(
      `${this.backendUrl}/google/verify`,
      { idToken }
    );
  }

  saveSession(token: string, avatar?: string): void {
    localStorage.setItem('token', token);
    if (avatar) {
      localStorage.setItem('avatar', avatar);
      this.avatarSubject.next(avatar);
    }
    this.roleSubject.next(this.readRoleFromToken(token) ?? 'USER');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
    this.avatarSubject.next(null);
    this.roleSubject.next('NONE');
    this.store.clearTournament();
  }

  setAvatar(avatar: string | null) {
    if (avatar) {
      localStorage.setItem('avatar', avatar);
    } else {
      localStorage.removeItem('avatar');
    }
    this.avatarSubject.next(avatar);
  }

  private readRoleFromToken(token?: string): 'ADMIN' | 'USER' | 'GUEST' | null {
    try {
      const t = token ?? localStorage.getItem('token');
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
    return !!localStorage.getItem('token');
  }

  getAvatar(): string | null {
    return localStorage.getItem('avatar');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
