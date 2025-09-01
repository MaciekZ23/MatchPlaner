import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CalendarDay } from './models/calendar-day.model';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { Match } from './models/match.model';
import { MatchService } from './services/match.service';
import { MatchDetailsModalComponent } from './components/match-details-modal/match-details-modal.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { Team as CoreTeam, Player as CorePlayer } from '../core/models';
import { TournamentStore } from '../core/services/tournament-store.service';
import { stringsCalendar } from './misc';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarDayComponent,
    CommonModule,
    MatchDetailsModalComponent,
    PageHeaderComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
})
export class CalendarComponent {
  moduleStrings = stringsCalendar;
  selectedMatch: Match | null = null;

  private readonly matchService = inject(MatchService);
  private readonly store = inject(TournamentStore);

  readonly days$: Observable<CalendarDay[]> =
    this.matchService.getCalendarDays$();
  readonly teamMap$: Observable<Map<string, CoreTeam>> = this.store.teamMap$;
  readonly playerMap$: Observable<Map<string, CorePlayer>> =
    this.store.playerMap$;

  openDetails(match: Match): void {
    this.selectedMatch = match;
  }

  closeDetails(): void {
    this.selectedMatch = null;
  }
}
