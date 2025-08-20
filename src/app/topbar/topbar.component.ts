import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsTopbar } from './misc/strings-topbar';
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

  avatar: string | null = localStorage.getItem('avatar') || null;

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
    window.location.reload();
  }
}
