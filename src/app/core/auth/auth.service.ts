import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly backendUrl = '/api/v1/admin/auth';

  private avatarSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('avatar')
  );

  avatar$ = this.avatarSubject.asObservable();

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
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
    this.avatarSubject.next(null);
  }

  setAvatar(avatar: string | null) {
    if (avatar) {
      localStorage.setItem('avatar', avatar);
    } else {
      localStorage.removeItem('avatar');
    }
    this.avatarSubject.next(avatar);
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
