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

  /** Sterowanie stanem otwarcia sidebaru */
  @Input() isOpen: boolean = true;

  /**
   * Emitowanie zdarzeń zmiany stanu sidebaru
   * - `manual` → użytkownik kliknął przycisk
   * - `resize` → sidebar zmieniony przez zmianę szerokości okna
   * - `close` → zamykanie sidebaru automatycznie (np. po wyborze opcji w mobile)
   */
  @Output() toggleSidebar = new EventEmitter<'manual' | 'resize' | 'close'>();

  private store = inject(TournamentStore);
  private router = inject(Router);

  tid$ = this.store.selectedId$;
  hasTid$ = this.store.hasTournament$;

  /** Zapamiętywanie ostatniej szerokości okna dla wykrywania zmiany */
  private lastWidth = window.innerWidth;

  /**
   * Reagowanie na zmianę rozmiaru okna — automatyczne otwieranie / zamykanie sidebaru
   * w zależności od breakpointu 768px
   */
  @HostListener('window:resize')
  onWindowResize() {
    if (window.innerWidth === this.lastWidth) {
      return;
    }
    const shouldBeOpen = window.innerWidth >= 768;
    if (shouldBeOpen !== this.isOpen) {
      this.toggleSidebar.emit('resize');
    }
    this.lastWidth = window.innerWidth;
  }

  /** Emitowanie zdarzenia ręcznego otwierania lub zamykania sidebaru */
  onToggleSidebar() {
    this.toggleSidebar.emit('manual');
  }

  /** Sprawdzanie, czy użytkownik jest na urządzeniu mobilnym */
  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  /**
   * Nawigowanie do strony turnieju lub przekierowanie do wyboru turnieju,
   * w zależności od tego, czy `tid` jest dostępny
   * W mobile sidebar automatycznie się zamyka
   */
  goOrPick(tid: string | null, segments: string[]) {
    if (!tid) {
      this.router.navigate(['/tournaments']);
      return;
    }
    this.router.navigate(['/', tid, ...segments]);
    if (this.isMobile()) {
      this.toggleSidebar.emit('close');
    }
  }
}
