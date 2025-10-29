import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { stringsNavbar } from './misc';
import { TournamentStore } from '../core/services/tournament-store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  moduleStrings = stringsNavbar;
  @Input() isOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<'manual' | 'resize'>();

  private store = inject(TournamentStore);
  private router = inject(Router);

  tid$ = this.store.selectedId$;
  hasTid$ = this.store.hasTournament$;

  @HostListener('window:resize')
  onWindowResize() {
    const shouldBeOpen = window.innerWidth >= 768;
    if (shouldBeOpen !== this.isOpen) {
      this.toggleSidebar.emit('resize');
    }
  }

  setInitialSidebarState() {
    this.isOpen = window.innerWidth >= 768;
  }

  onToggleSidebar() {
    this.toggleSidebar.emit('manual');
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  goOrPick(tid: string | null, segments: string[]) {
    if (!tid) {
      this.router.navigate(['/tournaments']);
      return;
    }
    this.router.navigate(['/', tid, ...segments]);
    if (this.isMobile()) {
      this.toggleSidebar.emit('manual');
    }
  }

  onNavClick(event: Event) {
    const el = event.target as HTMLElement;
    if (this.isMobile() && el.closest('a.nav-link')) {
      this.toggleSidebar.emit('resize');
    }
  }
}
