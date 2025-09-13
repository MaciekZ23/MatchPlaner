import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly backendUrl = '/api/v1/admin/auth';

  loginWithGoogle(
    idToken: string
  ): Observable<{ token: string; avatar?: string }> {
    return this.http.post<{ token: string; avatar?: string }>(
      `${this.backendUrl}/google/verify`,
      { idToken }
    );
  }

  saveSession(token: string, avatar?: string): void {
    localStorage.setItem('token', token);
    if (avatar) {
      localStorage.setItem('avatar', avatar);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
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
