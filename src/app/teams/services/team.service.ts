import { Injectable, inject } from '@angular/core';
import { combineLatest, map, of, switchMap, take, tap } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Team as UiTeam, Player as UiPlayer } from '../models/team';
import {
  Team as CoreTeam,
  Player as CorePlayer,
} from '../../core/models/tournament.models';
import { HttpTournamentApi } from '../../core/api/http-tournament.api';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly store = inject(TournamentStore);
  private readonly api = inject(HttpTournamentApi);

  getTeams$() {
    return combineLatest([this.store.teams$, this.store.players$]).pipe(
      map(([teams, players]) => this.mapToUiTeams(teams, players))
    );
  }

  getTeamById$(id: number) {
    return this.getTeams$().pipe(
      map((list) => list.find((t) => t.id === id) ?? null)
    );
  }

  createTeam$(team: CoreTeam, tournamentId?: string) {
    const tid$ = tournamentId
      ? of(tournamentId)
      : this.store.tournament$.pipe(
          take(1),
          map((t) => t.id)
        );

    return tid$.pipe(
      switchMap((tid) => this.api.createTeam(team, tid)),
      tap(() => this.store.refreshTeams()) // patrz punkt 2 niżej
    );
  }

  private mapToUiTeams(
    coreTeams: CoreTeam[],
    corePlayers: CorePlayer[]
  ): UiTeam[] {
    // Grupujemy zawodników wg teamId, żeby szybciej dopinać do drużyn
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

  private mapPlayerToUi = (p: CorePlayer): UiPlayer => ({
    name: p.name,
    position: this.positionPl(p.position),
    shirtNumber: p.shirtNumber,
    healthStatus: p.healthStatus === 'HEALTHY' ? 'Zdrowy' : 'Kontuzjowany',
  });

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
