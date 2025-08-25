import { Injectable, inject } from '@angular/core';
import { map, distinctUntilChanged, shareReplay } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { formatFullDate, capitalizeFirst } from '../../core/utils';

@Injectable({ providedIn: 'root' })
export class TournamentTitleService {
  private readonly store = inject(TournamentStore);

  private readonly tournament$ = this.store.tournament$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly title$ = this.tournament$.pipe(
    map((t) => t.name || 'Turniej'),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly dateRange$ = this.tournament$.pipe(
    map((t) => {
      const tz = t.timezone ?? 'Europe/Warsaw';
      const start = t.startDate
        ? capitalizeFirst(formatFullDate(t.startDate, tz, 'pl-PL'))
        : '';
      const end = t.endDate
        ? capitalizeFirst(formatFullDate(t.endDate, tz, 'pl-PL'))
        : '';
      return start && end ? `${start} - ${end}` : start || end || '';
    }),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
