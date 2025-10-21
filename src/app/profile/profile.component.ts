import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { stringsProfile } from './misc';

declare const bootstrap: any;

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
})
export class ProfileComponent implements OnInit, AfterViewInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  avatar$ = this.auth.avatar$;

  moduleStrings = stringsProfile;

  email: string | null = null;
  name: string | null = null;
  role: 'ADMIN' | 'USER' | 'GUEST' | 'NONE' = 'NONE';
  deviceId: string | null = null;

  ngOnInit(): void {
    const info = this.auth.getUserInfo();
    this.role = info.role;

    if (this.role === 'GUEST') {
      this.name = 'Gość';
      this.email = null;
      this.deviceId = this.ensureDeviceId();
    } else {
      this.name = info.name || 'Użytkownik';
      this.email = info.email;
    }
  }

  private ensureDeviceId(): string {
    const KEY = 'deviceId';
    let id = localStorage.getItem(KEY);
    if (!id) {
      const rnd = crypto.getRandomValues(new Uint32Array(4));
      id =
        'dev-' +
        Array.from(rnd)
          .map((n) => n.toString(16).padStart(8, '0'))
          .join('');
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  get roleLabel(): string {
    switch (this.role) {
      case 'ADMIN':
        return 'Administrator';
      case 'USER':
        return 'Użytkownik';
      case 'GUEST':
        return 'Gość';
      default:
        return 'Brak';
    }
  }

  copyToClipboard(text: string, btnEl: HTMLElement, copiedMsg = 'Skopiowano!') {
    if (!text) return;
    const bs = (window as any).bootstrap;

    const original =
      btnEl.getAttribute('data-original-label') ||
      btnEl.getAttribute('data-bs-title') ||
      '';

    const getTip = () => {
      if (!bs?.Tooltip) return null;
      return bs.Tooltip.getOrCreateInstance
        ? bs.Tooltip.getOrCreateInstance(btnEl, {
            trigger: 'manual',
            placement: 'top',
          })
        : bs.Tooltip.getInstance(btnEl) ||
            new bs.Tooltip(btnEl, { trigger: 'manual', placement: 'top' });
    };

    const showMsg = (msg: string) => {
      const tip = getTip();
      if (!tip) return;

      if (typeof tip.setContent === 'function') {
        tip.setContent({ '.tooltip-inner': msg });
      } else {
        btnEl.setAttribute('data-bs-title', msg);
      }
      tip.show();
      setTimeout(() => {
        tip.hide();
        if (typeof tip.setContent === 'function') {
          tip.setContent({ '.tooltip-inner': original });
        } else {
          btnEl.setAttribute('data-bs-title', original);
        }
      }, 1200);
    };

    navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(text).then(
          () => showMsg(copiedMsg),
          () => showMsg('Kopiowanie niedostępne')
        )
      : (function fallback() {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            showMsg(copiedMsg);
          } catch {
            showMsg('Kopiowanie niedostępne');
          } finally {
            document.body.removeChild(ta);
          }
        })();
  }

  ngAfterViewInit(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) return;
    document.querySelectorAll<HTMLElement>('.btn-copy').forEach((el) => {
      bs.Tooltip.getInstance?.(el) ?? new bs.Tooltip(el, { placement: 'top' });
    });
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
