import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SocialUser,
  SocialAuthService,
  GoogleLoginProvider,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { stringsLogin } from './misc';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})
export class LoginComponent implements OnInit {
  moduleStrings = stringsLogin;

  private auth = inject(SocialAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private appAuth = inject(AuthService);

  user: SocialUser | null = null;
  loading = false;
  errorMsg = '';

  private waitingForGoogleClick = false;

  ngOnInit(): void {
    this.auth.authState.subscribe((user) => {
      this.user = user;
      if (!this.waitingForGoogleClick || !user) {
        return;
      }
      this.loading = true;
      this.errorMsg = '';
      this.appAuth.loginWithGoogle(user.idToken).subscribe({
        next: ({ token, avatar }) => {
          this.appAuth.saveSession(token, avatar ?? user.photoUrl ?? undefined);
          this.navigateAfterLogin();
        },
        error: (err) => {
          console.error('Google login error:', err);
          this.errorMsg = 'Nie udało się zalogować przez Google';
          this.loading = false;
          this.waitingForGoogleClick = false;
        },
      });
    });
  }

  signInWithGoogle(): void {
    this.waitingForGoogleClick = true;
    this.loading = true;
    this.errorMsg = '';
    this.auth.signIn(GoogleLoginProvider.PROVIDER_ID).catch((e) => {
      console.error(e);
      this.waitingForGoogleClick = false;
      this.loading = false;
      this.errorMsg = 'Nie udało się uruchomić logowania Google';
    });
  }

  continueAsGuest(): void {
    this.loading = true;
    this.errorMsg = '';

    const deviceId = this.ensureDeviceId();

    this.http
      .post<{ token: string; guestId?: string }>('/api/v1/auth/guest', {
        deviceId,
      })
      .subscribe({
        next: ({ token }) => {
          this.appAuth.saveSession(token);
          this.navigateAfterLogin();
        },
        error: (err) => {
          console.error('Guest login error:', err);
          this.errorMsg = 'Nie udało się rozpocząć sesji gościa.';
          this.loading = false;
        },
      });
  }

  signOut(): void {
    this.appAuth.logout();
    this.auth.signOut().catch(() => {});
    this.router.navigateByUrl('/login');
  }

  private navigateAfterLogin() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.loading = false;
    this.waitingForGoogleClick = false;
    this.router.navigateByUrl(returnUrl);
  }

  private ensureDeviceId(): string {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = (crypto as any)?.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      localStorage.setItem('deviceId', id);
    }
    return id;
  }
}
