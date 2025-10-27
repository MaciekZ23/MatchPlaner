import { Injectable, Inject } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  forkJoin,
  map,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { ITournamentApi, TOURNAMENT_API } from '../api/tournament.api';
import { Team, Player, Match, Group } from '../models';

@Injectable({ providedIn: 'root' })
export class TournamentStore {
  private readonly KEY = 'selectedTournamentId';

  private tournamentId$ = new BehaviorSubject<string | null>(
    localStorage.getItem(this.KEY)
  );

  hasTournament$ = this.tournamentId$.pipe(map(Boolean));
  selectedId$ = this.tournamentId$.asObservable();

  tournament$ = this.tournamentId$.pipe(
    filter((id): id is string => !!id),
    switchMap((id) => this.api.getTournament(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  groups$ = this.tournament$.pipe(
    map((t) => t.groups),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  stages$ = this.tournament$.pipe(
    map((t) => [...t.stages].sort((a, b) => a.order - b.order)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  teams$ = this.tournamentId$.pipe(
    filter((id): id is string => !!id),
    switchMap((id) => this.api.getTeams(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  refreshTeams(): void {
    const id = this.tournamentId$.getValue();
    this.tournamentId$.next(id);
  }

  refreshPlayers(): void {
    const id = this.tournamentId$.getValue();
    this.tournamentId$.next(id);
  }

  refreshTournament(): void {
    const id = this.tournamentId$.getValue();
    this.tournamentId$.next(id);
  }

  players$ = this.tournamentId$.pipe(
    filter((id): id is string => !!id),
    switchMap((id) => this.api.getPlayers(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Słowniki pomocnicze
  teamMap$ = this.teams$.pipe(
    map((list) => new Map<string, Team>(list.map((t) => [t.id, t]))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  playerMap$ = this.players$.pipe(
    map((list) => new Map<string, Player>(list.map((p) => [p.id, p]))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  groupMap$ = this.groups$.pipe(
    map((list) => new Map<string, Group>(list.map((g) => [g.id, g]))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private matchesReload$ = new Subject<void>();

  matchesByStage$ = combineLatest([
    this.stages$,
    this.matchesReload$.pipe(startWith(void 0)), // pierwszy load + ręczne refresh
  ]).pipe(
    switchMap(([stages]) =>
      stages.length
        ? forkJoin(
            stages.map((s) =>
              this.api
                .getMatches(s.id)
                .pipe(map((ms) => [s.id, ms] as [string, Match[]]))
            )
          )
        : of([] as [string, Match[]][])
    ),
    map((entries) => new Map<string, Match[]>(entries)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  refreshMatches(): void {
    this.matchesReload$.next();
  }

  private stageReload$ = new Subject<string>();

  stageMatches$(stageId: string) {
    return this.stageReload$.pipe(
      startWith(stageId),
      filter((id) => id === stageId),
      switchMap(() => this.api.getMatches(stageId)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  refreshMatchesForStage(stageId: string) {
    this.stageReload$.next(stageId);
  }

  // Selektory wygodne dla komponentów ---
  getMatchesForStage(stageId: string) {
    return this.matchesByStage$.pipe(
      map((mapByStage) => mapByStage.get(stageId) ?? [])
    );
  }

  getGroupById(groupId: string) {
    return this.groupMap$.pipe(map((m) => m.get(groupId)));
  }

  getTeamsForGroup(groupId: string) {
    return this.teams$.pipe(
      map((teams) => teams.filter((t) => t.groupId === groupId))
    );
  }

  getSelectedIdSync(): string | null {
    return this['tournamentId$'].getValue();
  }

  setTournament(id: string | null) {
    this.tournamentId$.next(id);
    if (id) {
      localStorage.setItem(this.KEY, id);
    } else {
      localStorage.removeItem(this.KEY);
    }
  }

  clearTournament() {
    this.setTournament(null);
  }

  constructor(@Inject(TOURNAMENT_API) private api: ITournamentApi) {}
}
