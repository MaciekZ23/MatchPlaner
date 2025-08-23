import { Injectable, inject } from '@angular/core';
import { combineLatest, map, take } from 'rxjs';

import { TournamentStore } from '../../core/services/tournament-store.service';
import { Team as UiTeam, Player as UiPlayer } from '../models/team';
import {
  Team as CoreTeam,
  Player as CorePlayer,
} from '../../core/models/tournament.models';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly store = inject(TournamentStore);

  /** Zwraca natychmiastowego “snapshota” drużyn z mockowanych danych (pierwsza emisja). */
  getTeams(): UiTeam[] {
    let snapshot: UiTeam[] = [];

    combineLatest([this.store.teams$, this.store.players$])
      .pipe(
        take(1),
        map(([teams, players]) => this.mapToUiTeams(teams, players))
      )
      .subscribe((uiTeams) => (snapshot = uiTeams));

    return snapshot;
  }

  // --- mapowanie domena -> UI ---

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
      id: idx + 1, // UI ma number → nadajemy indeks
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
