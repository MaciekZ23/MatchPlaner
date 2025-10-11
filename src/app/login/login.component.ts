import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { stringsLogin } from './misc';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/auth/auth.service';
import { NotificationService } from '../core/notifications/notification.service';

declare global {
  interface Window {
    google?: any;
  }
}

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})
export class LoginComponent implements OnInit, AfterViewInit {
  moduleStrings = stringsLogin;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private appAuth = inject(AuthService);
  private notificationService = inject(NotificationService);

  loading = false;
  errorMsg = '';

  currentYear = new Date().getFullYear();

  private readonly CLIENT_ID =
    '23616475933-lb3r0o8kjt0mll98dlrvcmj5ekq1r4kc.apps.googleusercontent.com';

  private gisInitialized = false;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initGoogle();
  }

  private initGoogle() {
    const render = () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: this.CLIENT_ID,
          callback: (resp: any) => this.onGoogleCredential(resp),
          ux_mode: 'popup',
          auto_select: false,
          use_fedcm_for_prompt: false,
          itp_support: true,
        });
        this.gisInitialized = true;

        const host = document.getElementById('googleBtn');
        if (host) {
          window.google?.accounts.id.renderButton(host, {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'square',
            width: 280,
          });
        }
      } catch (e) {
        console.error('GIS init error', e);
        this.errorMsg = 'Nie udało się zainicjalizować logowania Google.';
      }
    };

    if (window.google?.accounts?.id) {
      render();
    } else {
      const t = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(t);
          render();
        }
      }, 100);
      setTimeout(() => clearInterval(t), 10000);
    }
  }

  signInWithGoogle(): void {
    this.errorMsg = '';
    this.loading = true;

    const tryPrompt = () => {
      try {
        window.google?.accounts.id.prompt((n: any) => {
          if (n?.isNotDisplayed?.() || n?.isSkippedMoment?.()) {
            this.loading = false;
            this.errorMsg =
              'Przeglądarka zablokowała okno logowania Google. Pozwól na third-party sign-in w ustawieniach strony lub spróbuj ponownie.';
          }
        });
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.errorMsg = 'Nie udało się uruchomić logowania Google.';
      }
    };

    if (this.gisInitialized) {
      tryPrompt();
    } else {
      // jeśli jeszcze się nie zdążyło zainicjalizować – zainicjalizuj i dopiero prompt
      this.initGoogle();
      const wait = setInterval(() => {
        if (this.gisInitialized) {
          clearInterval(wait);
          tryPrompt();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(wait);
        if (!this.gisInitialized) {
          this.loading = false;
          this.errorMsg =
            'Nie udało się zainicjalizować logowania Google. Odśwież stronę.';
        }
      }, 5000);
    }
  }

  private onGoogleCredential(resp: any) {
    const idToken: string | undefined = resp?.credential;
    if (!idToken) {
      this.loading = false;
      this.errorMsg = 'Brak tokenu logowania Google';
      return;
    }

    this.appAuth.loginWithGoogle(idToken).subscribe({
      next: ({ token, user }) => {
        const fallback = this.extractGooglePicture(idToken);
        const avatarUrl = user?.avatarUrl ?? fallback ?? undefined;

        this.appAuth.saveSession(token, avatarUrl);
        if (!user?.avatarUrl && fallback) {
          this.appAuth.setAvatar(fallback);
        }
        const info = this.appAuth.getUserInfo();

        if (info.role === 'ADMIN' || info.role === 'USER') {
          this.notificationService.addWelcome(
            info.role,
            info.name ?? undefined
          );
        } else if (info.role === 'GUEST') {
          this.notificationService.addWelcome('GUEST');
        }
        this.navigateAfterLogin();
      },
      error: (err) => {
        console.error('Google login error:', err);
        this.errorMsg = 'Nie udało się zalogować przez Google.';
        this.loading = false;
      },
    });
  }

  private extractGooglePicture(idToken: string): string | null {
    try {
      const [, payloadB64] = idToken.split('.');
      const payloadJson = atob(
        payloadB64.replace(/-/g, '+').replace(/_/g, '/')
      );
      const payload = JSON.parse(payloadJson);
      return payload?.picture ?? null;
    } catch {
      return null;
    }
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
          this.notificationService.addWelcome('GUEST');
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
    try {
      window.google?.accounts.id.disableAutoSelect?.();
    } catch {}
    this.router.navigateByUrl('/login');
  }

  private navigateAfterLogin() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.loading = false;
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
