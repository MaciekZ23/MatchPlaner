import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsTopbar } from './misc/strings-topbar';
import { AuthService } from '../core/auth/auth.service';
@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Input() isSidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  moduleStrings = stringsTopbar;

  private auth = inject(AuthService);
  avatar$ = this.auth.avatar$;

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    this.auth.logout();
    window.location.reload();
  }
}
