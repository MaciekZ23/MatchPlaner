import { Injectable, inject } from '@angular/core';
import { combineLatest, map, of, switchMap, take, tap } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Team as UiTeam, Player as UiPlayer } from '../models/team';
import {
  Team as CoreTeam,
  Player as CorePlayer,
} from '../../core/models/tournament.models';
import { HttpTournamentApi } from '../../core/api/http-tournament.api';
import {
  CreatePlayerPayload,
  CreateTeamPayload,
  UpdatePlayerPayload,
  UpdateTeamPayload,
} from '../../core/types';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly store = inject(TournamentStore);
  private readonly api = inject(HttpTournamentApi);

  /**
   * Zwraca strumień listy drużyn w formacie UI (zawodnicy są zmapowani do drużyn)
   */
  getTeams$() {
    return combineLatest([this.store.teams$, this.store.players$]).pipe(
      map(([teams, players]) => this.mapToUiTeams(teams, players))
    );
  }

  /**
   * Pobiera UI drużynę po ID UI
   */
  getTeamById$(id: number) {
    return this.getTeams$().pipe(
      map((list) => list.find((t) => t.id === id) ?? null)
    );
  }

  /**
   * Zwraca listę wszystkich Core Players bez mapowania do UI
   */
  getCorePlayers$() {
    return this.store.players$;
  }

  /**
   * Tworzy nową drużynę w API i odświeża store
   * Jeśli nie podano tournamentId to pobieramy aktualny z TournamentStore
   */
  createTeam$(team: CreateTeamPayload, tournamentId?: string) {
    const tid$ = tournamentId
      ? of(tournamentId)
      : this.store.tournament$.pipe(
          take(1),
          map((t) => t.id)
        );

    return tid$.pipe(
      switchMap((tid) => this.api.createTeam(team, tid)),
      tap(() => this.store.refreshTeams())
    );
  }

  /**
   * Aktualizuje dane drużyny na backendzie
   * Po zapisie odświeża store
   */
  updateTeam$(teamId: string, patch: UpdateTeamPayload) {
    return this.api
      .updateTeam(teamId, patch)
      .pipe(tap(() => this.store.refreshTeams()));
  }

  /**
   * Usuwa drużynę i wymusza odświeżenie listy drużyn i zawodników
   */
  deleteTeam$(teamId: string) {
    return this.api.deleteTeam(teamId).pipe(
      tap(() => {
        this.store.refreshTeams();
        this.store.refreshPlayers?.();
      })
    );
  }

  /**
   * Tworzy zawodnika na podstawie nazwy drużyny
   * Odświeża store teams + players po zapisie
   */
  createPlayer$(teamName: string, player: CreatePlayerPayload) {
    return this.store.teams$.pipe(
      take(1),
      map((coreTeams) => {
        const found = coreTeams.find(
          (t) => t.name.trim().toLowerCase() === teamName.trim().toLowerCase()
        );
        return found?.id ?? null;
      }),
      switchMap((teamId) => {
        if (!teamId) {
          throw new Error('Nie znaleziono drużyny o podanej nazwie.');
        }
        return this.api.createPlayer(teamId, player);
      }),
      tap(() => {
        this.store.refreshPlayers?.();
        this.store.refreshTeams?.();
      })
    );
  }

  /**
   * Aktualizuje dane zawodnika
   */
  updatePlayer$(playerId: string, patch: UpdatePlayerPayload) {
    return this.api
      .updatePlayer(playerId, patch)
      .pipe(tap(() => this.store.refreshPlayers?.()));
  }

  /**
   * Usuwa zawodnika i odświeża dane w store
   */
  deletePlayer$(playerId: string) {
    return this.api.deletePlayer(playerId).pipe(
      tap(() => {
        this.store.refreshPlayers?.();
        this.store.refreshTeams?.();
      })
    );
  }

  /**
   * Zwraca Core ID drużyny na podstawie jej UI ID
   */
  getCoreTeamIdByUiId$(uiId: number) {
    return combineLatest([this.getTeamById$(uiId), this.store.teams$]).pipe(
      take(1),
      map(([uiTeam, coreTeams]) => {
        if (!uiTeam) {
          throw new Error('Nie znaleziono drużyny (UI).');
        }
        const core = coreTeams.find((t) => {
          return (
            t.name.trim().toLowerCase() === uiTeam.name.trim().toLowerCase()
          );
        });
        if (!core) {
          throw new Error('Nie znaleziono drużyny (Core).');
        }
        return core.id;
      })
    );
  }

  /**
   * Wgrywa logo drużyny do backendu
   */
  uploadLogo$(teamId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.api
      .uploadTeamLogo(teamId, formData)
      .pipe(tap(() => this.store.refreshTeams?.()));
  }

  /**
   * Mapuje CoreTeam i CorePlayers na obiekt UI:
   * - generuje UI id
   * - grupuje zawodników w drużynie
   */
  private mapToUiTeams(
    coreTeams: CoreTeam[],
    corePlayers: CorePlayer[]
  ): UiTeam[] {
    const playersByTeam = corePlayers.reduce<Record<string, CorePlayer[]>>(
      (acc, p) => {
        (acc[p.teamId] ??= []).push(p);
        return acc;
      },
      {}
    );

    return coreTeams.map((t, idx) => ({
      id: idx + 1,
      name: t.name,
      logo: t.logo,
      players: (playersByTeam[t.id] ?? []).map((p) => this.mapPlayerToUi(p)),
    }));
  }

  /**
   * Mapuje zawodnika Core do UI, tłumaczy pola tekstowe
   */
  private mapPlayerToUi = (p: CorePlayer): UiPlayer => ({
    name: p.name,
    position: this.positionPl(p.position),
    shirtNumber: p.shirtNumber,
    healthStatus: p.healthStatus === 'HEALTHY' ? 'Zdrowy' : 'Kontuzjowany',
  });

  /**
   * Mapuje pozycję zawodnika z Core enum na tekst w UI
   */
  private positionPl(pos: CorePlayer['position']): UiPlayer['position'] {
    switch (pos) {
      case 'GK':
        return 'Bramkarz';
      case 'DEF':
        return 'Obrońca';
      case 'MID':
        return 'Pomocnik';
      case 'FWD':
        return 'Napastnik';
      default:
        return 'Pomocnik';
    }
  }
}
