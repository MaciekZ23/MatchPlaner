import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { stringsLogin } from './misc';
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
  private appAuth = inject(AuthService);
  private notificationService = inject(NotificationService);

  loading = false;
  errorMsg = '';

  /** Wyświetlanie aktualnego roku w stopce */
  currentYear = new Date().getFullYear();

  /** Google client ID (integracja OAuth) */
  private readonly CLIENT_ID =
    '23616475933-lb3r0o8kjt0mll98dlrvcmj5ekq1r4kc.apps.googleusercontent.com';

  /** Flaga inicjalizacji Google Identity Services */
  private gisInitialized = false;

  ngOnInit(): void {}

  /**
   * Po renderowaniu komponentu:
   * - inicjalizowanie przycisku logowania Google
   * - próba renderowania guzika Google (GIS)
   */
  ngAfterViewInit(): void {
    this.initGoogle();
  }

  /**
   * Inicjalizowanie Google Identity Services
   * - podpinanie callbacku
   * - renderowanie przycisku Google w kontenerze HTML
   * - obsługa fallbacku w przypadku opóźnienia ładowania scriptu GIS
   */
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

    // Jeśli GIS już dostępny to render
    if (window.google?.accounts?.id) {
      render();
    } else {
      // Jeśli ładuje się script to czekamy max 10s
      const t = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(t);
          render();
        }
      }, 100);
      setTimeout(() => clearInterval(t), 10000);
    }
  }

  /**
   * Uruchamianie logowania Google, wyświetlanie popupu
   * Obsługuje sytuacje:
   * - popup zablokowany przez przeglądarkę
   * - GIS jeszcze się ładuje
   */
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

  /**
   * Przetwarzanie danych z Google OAuth, odbieranie idToken
   * - logowanie do backendu
   * - zapis sesji (accessToken + refreshToken + awatar)
   * - powiadomienie użytkownika po zalogowaniu
   */
  private onGoogleCredential(resp: any) {
    const idToken: string | undefined = resp?.credential;
    if (!idToken) {
      this.loading = false;
      this.errorMsg = 'Brak tokenu logowania Google';
      return;
    }

    this.appAuth.loginWithGoogle(idToken).subscribe({
      next: ({ accessToken, refreshToken, user }) => {
        const fallback = this.extractGooglePicture(idToken);
        const avatarUrl = user?.avatarUrl ?? fallback ?? undefined;

        this.appAuth.saveSession(accessToken, avatarUrl, refreshToken);
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

  /**
   * Wyciągnięcie URL zdjęcia użytkownika z tokenu Google (fallback,
   * gdy backend nie zwróci avatarUrl)
   */
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

  /**
   * Logowanie jako gość
   * - backend tworzy tymczasowego użytkownika powiązanego z deviceId
   * - zapis accessToken + refreshToken
   */
  continueAsGuest(): void {
    this.loading = true;
    this.errorMsg = '';

    this.appAuth.loginAsGuest().subscribe({
      next: ({ accessToken, refreshToken }) => {
        this.appAuth.saveSession(accessToken, undefined, refreshToken);
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

  /** Wylogowanie użytkownika i przechodzenie do ekranu logowania */
  signOut(): void {
    this.appAuth.logout();
    try {
      window.google?.accounts.id.disableAutoSelect?.();
    } catch {}
    this.router.navigateByUrl('/login');
  }

  /** Nawigowanie po zalogowaniu na listę turniejów */
  private navigateAfterLogin() {
    this.loading = false;
    this.router.navigateByUrl('/tournaments');
  }
}
