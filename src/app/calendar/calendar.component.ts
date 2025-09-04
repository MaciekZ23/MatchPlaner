import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CalendarDay } from './models/calendar-day.model';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { Match } from './models/match.model';
import { MatchService } from './services/match.service';
import { MatchDetailsModalComponent } from './components/match-details-modal/match-details-modal.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { Team as CoreTeam, Player as CorePlayer } from '../core/models';
import { TournamentStore } from '../core/services/tournament-store.service';
import { VoteFacade } from './services/vote.facade';
import { stringsCalendar } from './misc';
import { stringsConfirmModal } from './misc';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarDayComponent,
    CommonModule,
    MatchDetailsModalComponent,
    PageHeaderComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
})
export class CalendarComponent {
  @ViewChild('confirmModal', { static: true })
  confirmModal!: ConfirmModalComponent;

  moduleStrings = stringsCalendar;
  confirmStrings = stringsConfirmModal;
  selectedMatch: Match | null = null;

  private readonly voteFacade = inject(VoteFacade);
  private readonly matchService = inject(MatchService);
  private readonly store = inject(TournamentStore);

  readonly days$: Observable<CalendarDay[]> =
    this.matchService.getCalendarDays$();
  readonly teamMap$: Observable<Map<string, CoreTeam>> = this.store.teamMap$;
  readonly playerMap$: Observable<Map<string, CorePlayer>> =
    this.store.playerMap$;

  async onRequestVoteConfirm(e: {
    matchId: string;
    playerId: string;
    playerName?: string;
  }) {
    const playerName = e.playerName ?? e.playerId;
    const ok = await this.confirmModal.open({
      title: this.confirmStrings.title,
      message: `${this.confirmStrings.message} (${playerName})`,
      labels: this.confirmStrings.labels,
    });

    if (ok) {
      this.voteFacade.voteFor(e.matchId as any, e.playerId);
    }
  }

  openDetails(match: Match): void {
    this.selectedMatch = match;
  }

  closeDetails(): void {
    this.selectedMatch = null;
  }
}
