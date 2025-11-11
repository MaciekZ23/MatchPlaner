import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Match as CoreMatch, Team as CoreTeam } from '../../core/models';
import { TeamStats, PointsTableGroup, TablesVM } from '../models';
import { getScore } from './helpers';

@Injectable({ providedIn: 'root' })
export class TeamTableService {
  private readonly store = inject(TournamentStore);

  getTablesVM$(): Observable<TablesVM> {
    return combineLatest([
      this.store.tournament$,
      this.store.matchesByStage$,
      this.store.teamMap$,
    ]).pipe(
      map(([tournament, matchesByStage, teamMap]) => {
        const mode = tournament.mode as TablesVM['mode'];

        const allGroups = this.buildAllGroupsTables(
          tournament,
          matchesByStage,
          teamMap
        );

        const playoffStageId: string | null =
          tournament.stages?.find((s: any) => s.kind === 'PLAYOFF')?.id ?? null;

        let groups: PointsTableGroup[] = [];
        if (mode === 'LEAGUE') {
          groups = allGroups.length ? [allGroups[0]] : [];
        } else if (mode === 'LEAGUE_PLAYOFFS') {
          groups = allGroups;
        } else if (mode === 'KNOCKOUT') {
          groups = [];
        }

        return { mode, groups, playoffStageId };
      })
    );
  }

  private buildAllGroupsTables(
    tournament: any,
    matchesByStage: Map<string, CoreMatch[]>,
    teamMap: Map<string, CoreTeam>
  ): PointsTableGroup[] {
    const groupStage = tournament.stages?.find((s: any) => s.kind === 'GROUP');
    if (!groupStage) {
      return [];
    }

    const all = (matchesByStage.get(groupStage.id) ?? []).slice();

    const groupNameById = new Map<string, string>();
    for (const g of tournament.groups ?? []) {
      if (g?.id) {
        groupNameById.set(g.id, g.name ?? `Grupa ${g.id}`);
      }
    }

    const byGroup = new Map<string, CoreMatch[]>();
    for (const m of all) {
      const key = m.groupId ?? 'UNGROUPED';
      if (!byGroup.has(key)) {
        byGroup.set(key, []);
      }
      byGroup.get(key)!.push(m);
    }

    const sortedIds = Array.from(byGroup.keys()).sort((a, b) => {
      const nameA =
        a === 'UNGROUPED' ? 'Tabela' : groupNameById.get(a) ?? `Grupa ${a}`;
      const nameB =
        b === 'UNGROUPED' ? 'Tabela' : groupNameById.get(b) ?? `Grupa ${b}`;
      return nameA.localeCompare(nameB, 'pl', { numeric: true });
    });

    const groups: PointsTableGroup[] = [];
    for (const groupId of sortedIds) {
      const matches = byGroup.get(groupId)!;
      const rows = this.buildAndSortGroupTable(matches, teamMap);
      const groupTitle =
        groupId === 'UNGROUPED'
          ? 'Tabela'
          : groupNameById.get(groupId) ?? `Grupa ${groupId}`;
      groups.push({ groupId, groupTitle, rows });
    }

    return groups;
  }

  private hasTeams(
    m: CoreMatch
  ): m is CoreMatch & { homeTeamId: string; awayTeamId: string } {
    return !!m.homeTeamId && !!m.awayTeamId;
  }

  private buildAndSortGroupTable(
    matches: CoreMatch[],
    teamMap: Map<string, CoreTeam>
  ): TeamStats[] {
    const finished = matches.filter((m) => m.status === 'FINISHED');
    const withTeams = finished.filter((m) => this.hasTeams(m));

    const teamIds = new Set<string>();
    for (const m of withTeams) {
      teamIds.add(m.homeTeamId);
      teamIds.add(m.awayTeamId);
    }

    const base = new Map<string, TeamStats>();
    for (const id of teamIds) {
      const t = teamMap.get(id);
      base.set(id, {
        id: 0,
        name: t?.name ?? id,
        logo: t?.logo,
        rm: 0,
        w: 0,
        r: 0,
        p: 0,
        pkt: 0,
        bz: 0,
        bs: 0,
        diff: 0,
      });
    }

    for (const m of withTeams) {
      const { home, away } = getScore(m);
      const homeRow = base.get(m.homeTeamId)!;
      const awayRow = base.get(m.awayTeamId)!;

      homeRow.rm++;
      awayRow.rm++;
      homeRow.bz += home;
      homeRow.bs += away;
      awayRow.bz += away;
      awayRow.bs += home;

      if (home > away) {
        homeRow.w++;
        awayRow.p++;
        homeRow.pkt += 3;
      } else if (home < away) {
        awayRow.w++;
        homeRow.p++;
        awayRow.pkt += 3;
      } else {
        homeRow.r++;
        awayRow.r++;
        homeRow.pkt++;
        awayRow.pkt++;
      }
    }

    for (const row of base.values()) row.diff = row.bz - row.bs;

    const table = Array.from(base.entries()).map(([teamId, row]) => ({
      teamId,
      row,
    }));
    table.sort((a, b) => b.row.pkt - a.row.pkt);

    const resolved: { teamId: string; row: TeamStats }[] = [];
    let i = 0;
    while (i < table.length) {
      let j = i + 1;
      while (j < table.length && table[j].row.pkt === table[i].row.pkt) j++;

      const cluster = table.slice(i, j);
      if (cluster.length === 1) {
        resolved.push(cluster[0]);
      } else if (cluster.length === 2) {
        cluster.sort((A, B) =>
          this.compareTwo(A.teamId, B.teamId, A.row, B.row, withTeams)
        );
        resolved.push(...cluster);
      } else {
        const ids = new Set(cluster.map((x) => x.teamId));
        const mini = this.buildMiniTable(ids, withTeams);

        cluster.sort((A, B) => {
          if (mini.get(B.teamId)!.pts !== mini.get(A.teamId)!.pts)
            return mini.get(B.teamId)!.pts - mini.get(A.teamId)!.pts;
          if (mini.get(B.teamId)!.gd !== mini.get(A.teamId)!.gd)
            return mini.get(B.teamId)!.gd - mini.get(A.teamId)!.gd;
          if (B.row.diff !== A.row.diff) return B.row.diff - A.row.diff;
          if (B.row.bz !== A.row.bz) return B.row.bz - A.row.bz;
          if (B.row.w !== A.row.w) return B.row.w - A.row.w;
          const awA = this.countAwayWins(A.teamId, withTeams);
          const awB = this.countAwayWins(B.teamId, withTeams);
          if (awB !== awA) return awB - awA;
          return A.teamId.localeCompare(B.teamId);
        });

        resolved.push(...cluster);
      }
      i = j;
    }

    resolved.forEach((it, idx) => {
      it.row.id = idx + 1;
    });
    return resolved.map((it) => it.row);
  }

  private compareTwo(
    aId: string,
    bId: string,
    a: TeamStats,
    b: TeamStats,
    matches: CoreMatch[]
  ): number {
    if (a.pkt !== b.pkt) return b.pkt - a.pkt;

    let aPts = 0,
      bPts = 0,
      aGD = 0,
      bGD = 0;
    for (const m of matches) {
      const isAB = m.homeTeamId === aId && m.awayTeamId === bId;
      const isBA = m.homeTeamId === bId && m.awayTeamId === aId;
      if (!isAB && !isBA) continue;

      const { home, away } = getScore(m);
      if (isAB) {
        if (home > away) aPts += 3;
        else if (home < away) bPts += 3;
        else {
          aPts++;
          bPts++;
        }
        aGD += home - away;
        bGD += away - home;
      } else {
        if (home > away) bPts += 3;
        else if (home < away) aPts += 3;
        else {
          aPts++;
          bPts++;
        }
        bGD += home - away;
        aGD += away - home;
      }
    }

    if (aPts !== bPts) return bPts - aPts;
    if (aGD !== bGD) return bGD - aGD;
    if (a.diff !== b.diff) return b.diff - a.diff;
    if (a.bz !== b.bz) return b.bz - a.bz;
    if (a.w !== b.w) return b.w - a.w;
    const awA = this.countAwayWins(aId, matches);
    const awB = this.countAwayWins(bId, matches);
    if (awB !== awA) return awB - awA;
    return a.name.localeCompare(b.name, 'pl');
  }

  private buildMiniTable(teams: Set<string>, matches: CoreMatch[]) {
    const res = new Map<
      string,
      { pts: number; gd: number; gf: number; ga: number }
    >();
    for (const id of teams) res.set(id, { pts: 0, gd: 0, gf: 0, ga: 0 });

    for (const m of matches) {
      if (!m.homeTeamId || !m.awayTeamId) continue;
      if (!teams.has(m.homeTeamId) || !teams.has(m.awayTeamId)) continue;

      const { home, away } = getScore(m);
      const A = res.get(m.homeTeamId)!;
      const B = res.get(m.awayTeamId)!;

      A.gf += home;
      A.ga += away;
      B.gf += away;
      B.ga += home;
      A.gd = A.gf - A.ga;
      B.gd = B.gf - B.ga;

      if (home > away) A.pts += 3;
      else if (home < away) B.pts += 3;
      else {
        A.pts++;
        B.pts++;
      }
    }

    const out = new Map<string, { pts: number; gd: number; gf: number }>();
    for (const [id, v] of res) out.set(id, { pts: v.pts, gd: v.gd, gf: v.gf });
    return out;
  }

  private countAwayWins(teamId: string, matches: CoreMatch[]) {
    let w = 0;
    for (const m of matches) {
      if (m.awayTeamId !== teamId) continue;
      const { home, away } = getScore(m);
      if (away > home) w++;
    }
    return w;
  }
}
