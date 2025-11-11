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
  /** Klucz w localStorage zapisujący wybrany turniej */
  private readonly KEY = 'selectedTournamentId';

  /** Przechowywanie aktualnie wybranego ID turnieju */
  private tournamentId$ = new BehaviorSubject<string | null>(
    localStorage.getItem(this.KEY)
  );

  /** Sprawdzanie, czy mamy wybrany turniej */
  hasTournament$ = this.tournamentId$.pipe(map(Boolean));
  /** Strumień aktualnie wybranego ID turnieju */
  selectedId$ = this.tournamentId$.asObservable();

  /** Pobieranie danych turnieju po ID */
  tournament$ = this.tournamentId$.pipe(
    filter((id): id is string => !!id),
    switchMap((id) => this.api.getTournament(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Pobieranie grup turnieju */
  groups$ = this.tournament$.pipe(
    map((t) => t.groups),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Pobieranie etapów turnieju sortowane po kolejności */
  stages$ = this.tournament$.pipe(
    map((t) => [...t.stages].sort((a, b) => a.order - b.order)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Pobieranie drużyn turnieju */
  teams$ = this.tournamentId$.pipe(
    filter((id): id is string => !!id),
    switchMap((id) => this.api.getTeams(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Wymuszanie odświeżenia listy drużyn w turnieju */
  refreshTeams(): void {
    const id = this.tournamentId$.getValue();
    this.tournamentId$.next(id);
  }

  /** Wymuszanie odświeżenia listy zawodników w turnieju */
  refreshPlayers(): void {
    const id = this.tournamentId$.getValue();
    this.tournamentId$.next(id);
  }

  /** Wymuszanie odświeżenia danych turnieju */
  refreshTournament(): void {
    const id = this.tournamentId$.getValue();
    this.tournamentId$.next(id);
  }

  /** Pobieranie zawodników turnieju */
  players$ = this.tournamentId$.pipe(
    filter((id): id is string => !!id),
    switchMap((id) => this.api.getPlayers(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Mapy ułatwiające szybkie pobieranie danych wg ID bez przeszukiwania tablic */
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

  /** Trigger odświeżania meczów */
  private matchesReload$ = new Subject<void>();

  /**
   * Pobieranie meczów dla każdej fazy turnieju
   * Wynik jako mapa { stageId: Match[] }
   */
  matchesByStage$ = combineLatest([
    this.stages$,
    this.matchesReload$.pipe(startWith(void 0)),
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

  /** Odświeżanie meczów we wszystkich fazach */
  refreshMatches(): void {
    this.matchesReload$.next();
  }

  /** Trigger odświeżania meczów konkretnej fazy */
  private stageReload$ = new Subject<string>();

  /**
   * Pobieranie meczów konkretnego etapu turnieju, czyli po stageId
   */
  stageMatches$(stageId: string) {
    return this.stageReload$.pipe(
      startWith(stageId),
      filter((id) => id === stageId),
      switchMap(() => this.api.getMatches(stageId)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** Odświeżanie meczów dla danego etapu */
  refreshMatchesForStage(stageId: string) {
    this.stageReload$.next(stageId);
  }

  /** Pobieranie meczów dla wybranego etapu (bez refetchowania) */
  getMatchesForStage(stageId: string) {
    return this.matchesByStage$.pipe(
      map((mapByStage) => mapByStage.get(stageId) ?? [])
    );
  }

  /** Pobieranie grupy po ID */
  getGroupById(groupId: string) {
    return this.groupMap$.pipe(map((m) => m.get(groupId)));
  }

  /** Pobieranie drużyn należących do danej grupy */
  getTeamsForGroup(groupId: string) {
    return this.teams$.pipe(
      map((teams) => teams.filter((t) => t.groupId === groupId))
    );
  }

  /** Pobieranie synchronizacyjnie aktualnie wybranego turnieju */
  getSelectedIdSync(): string | null {
    return this['tournamentId$'].getValue();
  }

  /**
   * Ustawianie wybranego turnieju, również zapis do localStorage
   */
  setTournament(id: string | null) {
    this.tournamentId$.next(id);
    if (id) {
      localStorage.setItem(this.KEY, id);
    } else {
      localStorage.removeItem(this.KEY);
    }
  }

  /** Usuwanie wyboru turnieju */
  clearTournament() {
    this.setTournament(null);
  }

  constructor(@Inject(TOURNAMENT_API) private api: ITournamentApi) {}
}
