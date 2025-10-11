import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsTopbar } from './misc/strings-topbar';
import { AuthService } from '../core/auth/auth.service';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../core/notifications/notification.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Input() isSidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  moduleStrings = stringsTopbar;

  private notifications = inject(NotificationService);
  private auth = inject(AuthService);
  avatar$ = this.auth.avatar$;
  notifications$ = this.notifications.notifications$;

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    this.auth.logout();
    window.location.reload();
  }

  clearNotifications() {
    this.notifications.clear();
  }

  trackById = (_: number, n: { id: string }) => n.id;
}
