import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { stringsTournamentTitle } from '../../misc';
import { TournamentStore } from '../../../core/services/tournament-store.service';
import { formatFullDate, capitalizeFirst } from '../../../core/utils';

@Component({
  selector: 'app-tournament-title',
  imports: [CommonModule],
  templateUrl: './tournament-title.component.html',
  styleUrls: ['./tournament-title.component.scss'],
  standalone: true,
})
export class TournamentTitleComponent {
  moduleStrings = stringsTournamentTitle;

  private readonly store = inject(TournamentStore);

  title$ = this.store.tournament$.pipe(map((t) => t.name));
  dateRange$ = this.store.tournament$.pipe(
    map((t) => {
      const tz = t.timezone ?? 'Europe/Warsaw';
      const start = t.startDate
        ? capitalizeFirst(formatFullDate(t.startDate, tz, 'pl-PL'))
        : '';
      const end = t.endDate
        ? capitalizeFirst(formatFullDate(t.endDate, tz, 'pl-PL'))
        : '';
      if (start && end) return `${start} - ${end}`;
      return start || end || '';
    })
  );
}
