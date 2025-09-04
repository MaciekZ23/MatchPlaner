import { Injectable, inject } from '@angular/core';
import { map, distinctUntilChanged, shareReplay } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';

@Injectable({ providedIn: 'root' })
export class LokalizacjaService {
  private readonly store = inject(TournamentStore);

  private readonly tournament$ = this.store.tournament$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly name$ = this.tournament$.pipe(
    map((t) => t.venue || ''),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly address$ = this.tournament$.pipe(
    map((t) => t.venueAddress || ''),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly imageUrl$ = this.tournament$.pipe(
    map((t) => t.venueImageUrl || ''),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly imageAlt$ = this.tournament$.pipe(
    map((t) => t.venue || 'Venue'),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
