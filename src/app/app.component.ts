import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from './topbar/topbar.component';
import { TournamentStore } from './core/services/tournament-store.service';
import { combineLatest, filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, TopbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  isSidebarOpen: boolean = true;

  private router = inject(Router);
  private store = inject(TournamentStore);
  hasTournament$ = this.store.hasTournament$;

  isNotTournamentPage$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(() => !this.router.url.startsWith('/tournaments')),
    startWith(!this.router.url.startsWith('/tournaments'))
  );

  showSidebar$ = combineLatest([
    this.hasTournament$,
    this.isNotTournamentPage$,
  ]).pipe(
    map(([hasTournament, isNotTournament]) => hasTournament && isNotTournament)
  );

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
