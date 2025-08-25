import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable, take } from 'rxjs';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Match as CoreMatch, Team as CoreTeam } from '../../core/models';
import { TeamStats, PointsTableGroup } from '../models';

@Injectable({ providedIn: 'root' })
export class TeamTableService {
  private readonly store = inject(TournamentStore);

  getTables(): Observable<PointsTableGroup[]> {
    return combineLatest([
      this.store.tournament$,
      this.store.matchesByStage$,
      this.store.teamMap$,
    ]).pipe(
      map(([tournament, matchesByStage, teamMap]) => {
        // 1) etap ligowy
        const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
        if (!groupStage) return [];

        // 2) mecze tego etapu
        const all = (matchesByStage.get(groupStage.id) ?? []).slice();

        // 3) mapowanie id->name z mocka
        const groupNameById = new Map<string, string>();
        for (const g of tournament.groups ?? []) {
          if (g?.id) groupNameById.set(g.id, g.name ?? `Grupa ${g.id}`);
        }

        // 4) grupowanie po groupId
        const byGroup = new Map<string, CoreMatch[]>();
        for (const m of all) {
          const key = m.groupId ?? 'UNGROUPED';
          if (!byGroup.has(key)) byGroup.set(key, []);
          byGroup.get(key)!.push(m);
        }

        // 5) posortowane klucze po NAZWIE (Grupa A, Grupa B, ...)
        const sortedIds = Array.from(byGroup.keys()).sort((a, b) => {
          const nameA =
            a === 'UNGROUPED' ? 'Tabela' : groupNameById.get(a) ?? `Grupa ${a}`;
          const nameB =
            b === 'UNGROUPED' ? 'Tabela' : groupNameById.get(b) ?? `Grupa ${b}`;
          return nameA.localeCompare(nameB, 'pl', { numeric: true });
        });

        // 6) budowa tabel dla każdej grupy
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

  /** Szybki snapshot (bez subskrypcji w komponencie) */
  getTablesSnapshot(): PointsTableGroup[] {
    let snap: PointsTableGroup[] = [];
    this.getTables()
      .pipe(take(1))
      .subscribe((r) => (snap = r));
    return snap;
  }

  /** Zgodność wstecz — zwraca wiersze pierwszej tabeli */
  getTable(): TeamStats[] {
    const groups = this.getTablesSnapshot();
    return groups[0]?.rows ?? [];
  }

  // =================== PRIVATE ===================

  /** Liczenie surowych statystyk i sortowanie pełnymi tie-breakerami */
  private buildAndSortGroupTable(
    matches: CoreMatch[],
    teamMap: Map<string, CoreTeam>
  ): TeamStats[] {
    const finished = matches.filter((m) => m.status === 'FINISHED');

    const teamIds = new Set<string>();
    for (const m of finished) {
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

    // zliczanie meczów
    for (const m of finished) {
      const { home, away } = this.getScore(m);

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

    const rows = Array.from(base.entries()).map(([teamId, row]) => ({
      teamId,
      row,
    }));
    const comparator = this.makeFullComparator(finished);
    rows.sort((a, b) => comparator(a.teamId, b.teamId, a.row, b.row));
    rows.forEach((it, idx) => (it.row.id = idx + 1));
    return rows.map((it) => it.row);
  }

  /** Komparator z pełnym łańcuchem reguł remisów */
  private makeFullComparator(groupMatches: CoreMatch[]) {
    const matchesBetween = (teams: Set<string>) =>
      groupMatches.filter(
        (m) => teams.has(m.homeTeamId) && teams.has(m.awayTeamId)
      );

    const cardsPointsByTeam = this.buildDisciplineIndex(groupMatches);
    const awayWinsIndex = this.buildAwayWinsIndex(groupMatches);

    return (aId: string, bId: string, a: TeamStats, b: TeamStats): number => {
      // 0) punkty ogółem
      if (a.pkt !== b.pkt) return b.pkt - a.pkt;

      const tier = new Set<string>([aId, bId]);
      const h2h = matchesBetween(tier);

      // 1) punkty H2H
      const [aH2Hp, bH2Hp] = this.headToHeadPoints(h2h, aId, bId);
      if (aH2Hp !== bH2Hp) return bH2Hp - aH2Hp;

      // 2) różnica bramek H2H
      const [aH2Hgd, bH2Hgd] = this.headToHeadGoalDiff(h2h, aId, bId);
      if (aH2Hgd !== bH2Hgd) return bH2Hgd - aH2Hgd;

      // 3) „reguła wyjazdowa” H2H (2 zespoły) — więcej goli na wyjeździe
      const awayA = this.headToHeadAwayGoals(h2h, aId);
      const awayB = this.headToHeadAwayGoals(h2h, bId);
      if (awayA !== awayB) return awayB - awayA;

      // 4) różnica bramek ogółem
      if (a.diff !== b.diff) return b.diff - a.diff;

      // 5) więcej goli ogółem
      if (a.bz !== b.bz) return b.bz - a.bz;

      // 6) więcej zwycięstw ogółem
      if (a.w !== b.w) return b.w - a.w;

      // 7) więcej zwycięstw na wyjeździe
      const aAwayW = awayWinsIndex.get(aId) ?? 0;
      const bAwayW = awayWinsIndex.get(bId) ?? 0;
      if (aAwayW !== bAwayW) return bAwayW - aAwayW;

      // 8) mniej punktów karnych (kartki)
      const aDisc = cardsPointsByTeam.get(aId) ?? 0;
      const bDisc = cardsPointsByTeam.get(bId) ?? 0;
      if (aDisc !== bDisc) return aDisc - bDisc;

      // 9) Fair Play — pomijamy; ostatni tie-breaker: nazwa A→Z
      return a.name.localeCompare(b.name, 'pl');
    };
  }

  // ---------- H2H helpers ----------

  private headToHeadPoints(
    h2h: CoreMatch[],
    aId: string,
    bId: string
  ): [number, number] {
    let aP = 0,
      bP = 0;
    for (const m of h2h) {
      const { home, away } = this.getScore(m);
      if (m.homeTeamId === aId && m.awayTeamId === bId) {
        if (home > away) aP += 3;
        else if (home < away) bP += 3;
        else {
          aP++;
          bP++;
        }
      } else if (m.homeTeamId === bId && m.awayTeamId === aId) {
        if (home > away) bP += 3;
        else if (home < away) aP += 3;
        else {
          aP++;
          bP++;
        }
      }
    }
    return [aP, bP];
  }

  private headToHeadGoalDiff(
    h2h: CoreMatch[],
    aId: string,
    bId: string
  ): [number, number] {
    let aGF = 0,
      aGA = 0,
      bGF = 0,
      bGA = 0;
    for (const m of h2h) {
      const { home, away } = this.getScore(m);
      if (m.homeTeamId === aId && m.awayTeamId === bId) {
        aGF += home;
        aGA += away;
        bGF += away;
        bGA += home;
      }
      if (m.homeTeamId === bId && m.awayTeamId === aId) {
        bGF += home;
        bGA += away;
        aGF += away;
        aGA += home;
      }
    }
    return [aGF - aGA, bGF - bGA];
  }

  private headToHeadAwayGoals(h2h: CoreMatch[], teamId: string): number {
    let awayGoals = 0;
    for (const m of h2h) {
      const { away } = this.getScore(m);
      if (m.awayTeamId === teamId) awayGoals += away;
    }
    return awayGoals;
  }

  // ---------- discipline / wins-away ----------

  private buildDisciplineIndex(matches: CoreMatch[]): Map<string, number> {
    const pts = new Map<string, number>();
    const add = (teamId: string, v: number) =>
      pts.set(teamId, (pts.get(teamId) ?? 0) + v);

    for (const m of matches) {
      // śledzimy, kto miał już żółtą w danym meczu (team+player)
      const hadYellow = new Set<string>();

      for (const ev of m.events ?? []) {
        if (ev.type !== 'CARD') continue;
        if (!ev.teamId) continue;

        const key = `${ev.teamId}:${ev.playerId}`;

        switch (ev.card) {
          case 'YELLOW':
            add(ev.teamId, 1);
            hadYellow.add(key);
            break;

          case 'SECOND_YELLOW':
            // 3 pkt łącznie (1 za pierwszą + 2 „dodatkowe” za drugą)
            add(ev.teamId, hadYellow.has(key) ? 2 : 3);
            break;

          case 'RED':
            add(ev.teamId, 3);
            break;

          default:
            // nieznany wariant – ignorujemy
            break;
        }
      }
    }
    return pts;
  }

  private buildAwayWinsIndex(matches: CoreMatch[]): Map<string, number> {
    const wins = new Map<string, number>();
    const bump = (teamId: string) =>
      wins.set(teamId, (wins.get(teamId) ?? 0) + 1);

    for (const m of matches) {
      if (m.status !== 'FINISHED') continue;
      const { home, away } = this.getScore(m);
      if (away > home) bump(m.awayTeamId);
    }
    return wins;
  }

  // ---------- score helpers ----------

  private getScore(m: CoreMatch): { home: number; away: number } {
    if (m.score) return { home: m.score.home, away: m.score.away };

    let h = 0,
      a = 0;
    for (const ev of m.events ?? []) {
      if (ev.type === 'GOAL') {
        if (ev.teamId === m.homeTeamId) h++;
        else if (ev.teamId === m.awayTeamId) a++;
      } else if (ev.type === 'OWN_GOAL') {
        if (ev.teamId === m.homeTeamId) a++;
        else if (ev.teamId === m.awayTeamId) h++;
      }
    }
    return { home: h, away: a };
  }
}
