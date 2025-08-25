import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable, take } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Match as CoreMatch, Team as CoreTeam } from '../../core/models';
import { TeamStats, PointsTableGroup } from '../models';
import {
  getScore,
  buildDisciplineIndex,
  buildAwayWinsIndex,
  makeStandingsComparator,
} from './helpers';

@Injectable({ providedIn: 'root' })
export class TeamTableService {
  private readonly store = inject(TournamentStore);

  getTeamTables(): Observable<PointsTableGroup[]> {
    return combineLatest([
      this.store.tournament$,
      this.store.matchesByStage$,
      this.store.teamMap$,
    ]).pipe(
      map(([tournament, matchesByStage, teamMap]) => {
        // Etap ligowy
        const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
        if (!groupStage) return [];

        // Mecze tego etapu
        const all = (matchesByStage.get(groupStage.id) ?? []).slice();

        // Mapowanie id->name z mocka
        const groupNameById = new Map<string, string>();
        for (const g of tournament.groups ?? []) {
          if (g?.id) groupNameById.set(g.id, g.name ?? `Grupa ${g.id}`);
        }

        // Grupowanie po groupId
        const byGroup = new Map<string, CoreMatch[]>();
        for (const m of all) {
          const key = m.groupId ?? 'UNGROUPED';
          if (!byGroup.has(key)) byGroup.set(key, []);
          byGroup.get(key)!.push(m);
        }

        // Posortowane klucze po NAZWIE (Grupa A, Grupa B, ...)
        const sortedIds = Array.from(byGroup.keys()).sort((a, b) => {
          const nameA =
            a === 'UNGROUPED' ? 'Tabela' : groupNameById.get(a) ?? `Grupa ${a}`;
          const nameB =
            b === 'UNGROUPED' ? 'Tabela' : groupNameById.get(b) ?? `Grupa ${b}`;
          return nameA.localeCompare(nameB, 'pl', { numeric: true });
        });

        // Budowa tabel dla każdej grupy
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
      })
    );
  }

  getTablesSnapshot(): PointsTableGroup[] {
    let snap: PointsTableGroup[] = [];
    this.getTeamTables()
      .pipe(take(1))
      .subscribe((r) => (snap = r));
    return snap;
  }

  getTable(): TeamStats[] {
    const groups = this.getTablesSnapshot();
    return groups[0]?.rows ?? [];
  }

  /** Liczenie surowych statystyk i sortowanie pełnymi tie-breakerami */
  private buildAndSortGroupTable(
    matches: CoreMatch[],
    teamMap: Map<string, CoreTeam>
  ): TeamStats[] {
    const finished = matches.filter((m) => m.status === 'FINISHED');

    // Zespoły obecne w zakończonych meczach
    const teamIds = new Set<string>();
    for (const m of finished) {
      teamIds.add(m.homeTeamId);
      teamIds.add(m.awayTeamId);
    }

    // Baza wierszy
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

    // Zliczanie meczów
    for (const m of finished) {
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

    // Sortowanie z pełnym łańcuchem tie-breakerów (zgodnie z przepisami)
    const cardsPointsByTeam = buildDisciplineIndex(finished);
    const awayWinsIndex = buildAwayWinsIndex(finished);
    const comparator = makeStandingsComparator(
      finished,
      cardsPointsByTeam,
      awayWinsIndex
    );

    const rows = Array.from(base.entries()).map(([teamId, row]) => ({
      teamId,
      row,
    }));
    rows.sort((a, b) => comparator(a.teamId, b.teamId, a.row, b.row));
    rows.forEach((it, idx) => (it.row.id = idx + 1));

    return rows.map((it) => it.row);
  }
}
