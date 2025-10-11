import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { stringsProfile } from './misc';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
})
export class ProfileComponent implements OnInit {
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

  onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
