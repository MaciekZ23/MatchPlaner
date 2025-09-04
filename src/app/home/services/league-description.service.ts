import { Injectable, inject } from '@angular/core';
import { map, distinctUntilChanged, shareReplay } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';

@Injectable({ providedIn: 'root' })
export class LeagueDescriptionService {
  private readonly store = inject(TournamentStore);

  private readonly tournament$ = this.store.tournament$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly description$ = this.tournament$.pipe(
    map((t) => t.description || ''),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly additionalInfo$ = this.tournament$.pipe(
    map((t) => t.additionalInfo || ''),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
