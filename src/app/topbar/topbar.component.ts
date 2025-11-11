import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsTopbar } from './misc/strings-topbar';
import { AuthService } from '../core/auth/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../core/notifications/notification.service';
import { TournamentStore } from '../core/services/tournament-store.service';
import { combineLatest, filter, map, startWith } from 'rxjs';

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
  private store = inject(TournamentStore);
  private router = inject(Router);
  avatar$ = this.auth.avatar$;
  notifications$ = this.notifications.notifications$;
  hasTournament$ = this.store.hasTournament$;
  currentTid$ = this.store.selectedId$;

  /** Określanie czy aktualny widok to nie jest lista turniejów */
  isNotTournamentPage$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(() => !this.router.url.startsWith('/tournaments')),
    startWith(!this.router.url.startsWith('/tournaments'))
  );

  /** Pokazywanie sidebaru tylko gdy wybrano turniej i nie jesteśmy na liście turniejów */
  showSidebar$ = combineLatest([
    this.hasTournament$,
    this.isNotTournamentPage$,
  ]).pipe(
    map(([hasTournament, isNotTournament]) => hasTournament && isNotTournament)
  );

  /** Emitowanie zdarzenia przełączenia widoczności sidebaru */
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  /** Wylogowywanie użytkownika i przechodzenie do ekranu logowania */
  onLogout() {
    this.auth.logout();
    this.store.clearTournament();
    this.router.navigateByUrl('/login');
  }

  /** Zmienianie aktualnego turnieju i przechodzenie do listy turniejów */
  changeTournament() {
    this.store.clearTournament();
    this.router.navigateByUrl('/tournaments');
  }

  /** Czyszczenie wszystkich powiadomień użytkownika */
  clearNotifications() {
    this.notifications.clear();
  }

  /** Optymalizacja renderowania listy powiadomień (trackBy w ngFor) */
  trackById = (_: number, n: { id: string }) => n.id;
}
