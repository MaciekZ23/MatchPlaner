import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable, take } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import {
  Match as CoreMatch,
  Player as CorePlayer,
  Team as CoreTeam,
} from '../../core/models';
import { GoalkeepersCleanSheets } from '../models';

@Injectable({ providedIn: 'root' })
export class GoalkeepersCleanSheetsService {
  private readonly store = inject(TournamentStore);

  getCleanSheets(): Observable<GoalkeepersCleanSheets[]> {
    return combineLatest([
      this.store.matchesByStage$,
      this.store.playerMap$,
      this.store.teamMap$,
    ]).pipe(
      map(([matchesByStage, playerMap, teamMap]) => {
        const allMatches: CoreMatch[] = Array.from(
          matchesByStage.values()
        ).flat();

        const csCount = new Map<string, number>();

        for (const m of allMatches) {
          if (m.status !== 'FINISHED') continue;

          const concededHome = this.concededForSide(m, 'HOME');
          const concededAway = this.concededForSide(m, 'AWAY');

          if (concededHome === 0) {
            const homeGKs = this.resolveGKsForSide(m, 'HOME', playerMap);
            for (const id of new Set(homeGKs)) {
              csCount.set(id, (csCount.get(id) ?? 0) + 1);
            }
          }
          if (concededAway === 0) {
            const awayGKs = this.resolveGKsForSide(m, 'AWAY', playerMap);
            for (const id of new Set(awayGKs)) {
              csCount.set(id, (csCount.get(id) ?? 0) + 1);
            }
          }
        }

        const rows: GoalkeepersCleanSheets[] = [];
        for (const [gkId, count] of csCount) {
          const p = playerMap.get(gkId);
          if (!p) continue;
          const t = teamMap.get(p.teamId);
          rows.push({
            playerId: gkId,
            playerName: p.name,
            teamId: p.teamId,
            teamName: t?.name ?? p.teamId,
            cleanSheets: count,
          });
        }

        return rows.sort((a, b) => {
          const d = b.cleanSheets - a.cleanSheets;
          return d !== 0 ? d : a.playerName.localeCompare(b.playerName, 'pl');
        });
      })
    );
  }

  getCleanSheetsSnapshot(): GoalkeepersCleanSheets[] {
    let snap: GoalkeepersCleanSheets[] = [];
    this.getCleanSheets()
      .pipe(take(1))
      .subscribe((r) => (snap = r));
    return snap;
  }

  private concededForSide(m: CoreMatch, side: 'HOME' | 'AWAY'): number {
    if (m.score) {
      return side === 'HOME' ? m.score.away : m.score.home;
    }
    let homeGoals = 0;
    let awayGoals = 0;
    for (const ev of m.events ?? []) {
      if (ev.type === 'GOAL') {
        if (ev.teamId === m.homeTeamId) homeGoals++;
        else if (ev.teamId === m.awayTeamId) awayGoals++;
      } else if (ev.type === 'OWN_GOAL') {
        if (ev.teamId === m.homeTeamId) awayGoals++;
        else if (ev.teamId === m.awayTeamId) homeGoals++;
      }
    }
    return side === 'HOME' ? awayGoals : homeGoals;
  }

  private resolveGKsForSide(
    m: CoreMatch,
    side: 'HOME' | 'AWAY',
    playerMap: Map<string, CorePlayer>
  ): string[] {
    const teamId = side === 'HOME' ? m.homeTeamId : m.awayTeamId;

    const fromLineup = this.pickGoalkeeperIdsFromLineup(m, side);
    if (fromLineup.length) return fromLineup;

    const fallback = this.pickDefaultGoalkeeperFromRoster(teamId, playerMap);
    return fallback ? [fallback] : [];
  }

  private pickGoalkeeperIdsFromLineup(
    m: CoreMatch,
    side: 'HOME' | 'AWAY'
  ): string[] {
    const ids = side === 'HOME' ? m.lineups?.homeGKIds : m.lineups?.awayGKIds;
    return (ids ?? []).filter(Boolean) as string[];
  }

  private pickDefaultGoalkeeperFromRoster(
    teamId: string,
    playerMap: Map<string, CorePlayer>
  ): string | null {
    const gks: CorePlayer[] = [];
    for (const p of playerMap.values()) {
      if (p.teamId === teamId && p.position === 'GK') gks.push(p);
    }
    if (!gks.length) return null;
    gks.sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999));
    return gks[0]?.id ?? null;
  }
}
