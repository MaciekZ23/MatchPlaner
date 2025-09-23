import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Match as CoreMatch, Team as CoreTeam } from '../../core/models';
import { TeamStats, PointsTableGroup, TablesVM } from '../models';
import {
  getScore,
  buildDisciplineIndex,
  buildAwayWinsIndex,
  makeStandingsComparator,
} from './helpers';

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

  /** Pomocniczy type-guard: tylko mecze z ustawionymi teamId */
  private hasTeams(
    m: CoreMatch
  ): m is CoreMatch & { homeTeamId: string; awayTeamId: string } {
    return !!m.homeTeamId && !!m.awayTeamId;
  }

  /** Liczenie surowych statystyk i sortowanie pełnymi tie-breakerami */
  private buildAndSortGroupTable(
    matches: CoreMatch[],
    teamMap: Map<string, CoreTeam>
  ): TeamStats[] {
    const finished = matches.filter((m) => m.status === 'FINISHED');

    // Bierzemy tylko te z pewnymi ID zespołów (type guard zwęża typy)
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

    for (const row of base.values()) {
      row.diff = row.bz - row.bs;
    }

    const cardsPointsByTeam = buildDisciplineIndex(withTeams);
    const awayWinsIndex = buildAwayWinsIndex(withTeams);
    const comparator = makeStandingsComparator(
      withTeams,
      cardsPointsByTeam,
      awayWinsIndex
    );

    const rows = Array.from(base.entries()).map(([teamId, row]) => {
      return { teamId, row };
    });
    rows.sort((a, b) => comparator(a.teamId, b.teamId, a.row, b.row));
    rows.forEach((it, idx) => {
      it.row.id = idx + 1;
    });

    return rows.map((it) => it.row);
  }
}
