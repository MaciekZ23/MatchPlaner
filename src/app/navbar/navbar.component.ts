import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { stringsNavbar } from './misc';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  moduleStrings = stringsNavbar;
  @Input() isOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  ngOnInit() {
    this.setInitialSidebarState();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.setInitialSidebarState();
  }

  setInitialSidebarState() {
    this.isOpen = window.innerWidth >= 768;
  }

  onToggleSidebar() {
    this.isOpen = !this.isOpen;
    this.toggleSidebar.emit(); // emitujesz do rodzica jeśli trzeba
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  onNavClick(event: Event) {
    const el = event.target as HTMLElement;
    if (this.isMobile() && el.closest('a.nav-link')) {
      this.isOpen = false;
    }
  }
}
