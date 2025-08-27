import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import {
  Match as CoreMatch,
  Player as CorePlayer,
  Team as CoreTeam,
} from '../../core/models';
import { TopScorer } from '../models';
import { TopScorersSortKey } from '../types';

@Injectable({ providedIn: 'root' })
export class TopScorerService {
  private readonly store = inject(TournamentStore);

  getTopScorers$(
    sortBy: TopScorersSortKey = 'goals',
    dir: 'asc' | 'desc' = 'desc'
  ): Observable<TopScorer[]> {
    return combineLatest([
      this.store.matchesByStage$,
      this.store.playerMap$,
      this.store.teamMap$,
    ]).pipe(
      map(([matchesByStage, playerMap, teamMap]) => {
        const allMatches: CoreMatch[] = Array.from(
          matchesByStage.values()
        ).flat();

        const goals = new Map<string, number>();
        const assists = new Map<string, number>();

        for (const m of allMatches) {
          for (const ev of m.events ?? []) {
            if (ev.type === 'GOAL') {
              goals.set(ev.playerId, (goals.get(ev.playerId) ?? 0) + 1);
            } else if (ev.type === 'ASSIST') {
              assists.set(ev.playerId, (assists.get(ev.playerId) ?? 0) + 1);
            }
          }
        }

        const playerIds = new Set<string>([...goals.keys(), ...assists.keys()]);
        const rows: TopScorer[] = [];

        for (const pid of playerIds) {
          const p: CorePlayer | undefined = playerMap.get(pid);
          if (!p) continue;

          const t: CoreTeam | undefined = teamMap.get(p.teamId);
          const g = goals.get(pid) ?? 0;
          const a = assists.get(pid) ?? 0;

          rows.push({
            playerId: pid,
            playerName: p.name,
            teamId: p.teamId,
            teamName: t?.name ?? p.teamId,
            goals: g,
            assists: a,
            points: g + a,
          });
        }

        return this.sortRows(rows, sortBy, dir);
      })
    );
  }

  private sortRows(
    rows: TopScorer[],
    sortBy: TopScorersSortKey,
    dir: 'asc' | 'desc'
  ): TopScorer[] {
    const main: TopScorersSortKey = sortBy ?? 'goals';
    const tiebreakers: TopScorersSortKey[] =
      main === 'goals'
        ? ['points', 'assists']
        : main === 'assists'
        ? ['points', 'goals']
        : ['goals', 'assists'];

    const cmpNum = (x: number, y: number) => (dir === 'asc' ? x - y : y - x);

    return rows.slice().sort((a, b) => {
      const dMain = cmpNum(a[main], b[main]);
      if (dMain !== 0) {
        return dMain;
      }

      for (const key of tiebreakers) {
        const d = cmpNum(a[key], b[key]);
        if (d !== 0) {
          return d;
        }
      }
      return a.playerName.localeCompare(b.playerName, 'pl');
    });
  }
}
