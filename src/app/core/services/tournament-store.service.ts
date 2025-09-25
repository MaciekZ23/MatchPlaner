import { Injectable, Inject } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { ITournamentApi, TOURNAMENT_API } from '../api/tournament.api';
import { Team, Player, Match, Group } from '../models';

@Injectable({ providedIn: 'root' })
export class TournamentStore {
  // Który turniej oglądamy (na razie 't1')
  private tournamentId$ = new BehaviorSubject<string>('t1');

  // Podstawowe strumienie
  tournament$ = this.tournamentId$.pipe(
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

  players$ = this.tournamentId$.pipe(
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

  // Mecze per stage (mapa: stageId -> Match[])
  matchesByStage$ = this.stages$.pipe(
    switchMap((stages) =>
      stages.length
        ? combineLatest(
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
    return combineLatest([this.getGroupById(groupId), this.teamMap$]).pipe(
      map(([g, tmap]) =>
        g ? g.teamIds.map((id) => tmap.get(id)!).filter(Boolean) : []
      )
    );
  }

  setTournament(id: string) {
    this.tournamentId$.next(id);
  }

  constructor(@Inject(TOURNAMENT_API) private api: ITournamentApi) {}
}
