import { Injectable, inject } from '@angular/core';
import { TournamentStore } from '../../core/services/tournament-store.service';
import {
  combineLatest,
  distinctUntilChanged,
  interval,
  map,
  shareReplay,
  startWith,
} from 'rxjs';
import { Countdown } from '../modules';
import { parseApiDate } from '../../core/utils';

@Injectable({ providedIn: 'root' })
export class MatchTimerService {
  private readonly store = inject(TournamentStore);

  readonly startDate$ = this.store.tournament$.pipe(
    map((t) => parseApiDate(t.startDate)),
    distinctUntilChanged((a, b) => (a?.getTime() ?? 0) === (b?.getTime() ?? 0)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly endDate$ = this.store.tournament$.pipe(
    map((t) => parseApiDate(t.endDate)),
    distinctUntilChanged((a, b) => (a?.getTime() ?? 0) === (b?.getTime() ?? 0)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly countdown$ = combineLatest([
    this.startDate$,
    this.endDate$,
    interval(1000).pipe(startWith(0)),
  ]).pipe(
    map(([start, end]): Countdown => {
      const now = new Date();

      if (!start || !end) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'before' };
      }

      if (now < start) {
        const diff = start.getTime() - now.getTime();
        return this.buildCountdown(diff, 'before');
      }

      if (now >= end) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'ended' };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'running' };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private buildCountdown(
    diff: number,
    status: 'before' | 'running'
  ): Countdown {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, status };
  }
}
