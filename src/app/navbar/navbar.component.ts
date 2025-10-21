import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnInit,
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
export class NavbarComponent implements OnInit {
  moduleStrings = stringsNavbar;
  @Input() isOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  private store = inject(TournamentStore);
  private router = inject(Router);

  tid$ = this.store.selectedId$;
  hasTid$ = this.store.hasTournament$;

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
    this.toggleSidebar.emit(); 
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
    if (this.isMobile()) this.isOpen = false;
  }

  onNavClick(event: Event) {
    const el = event.target as HTMLElement;
    if (this.isMobile() && el.closest('a.nav-link')) {
      this.isOpen = false;
    }
  }
}
