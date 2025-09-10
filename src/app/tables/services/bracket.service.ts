import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import { BracketMatch, BracketTeamSlot } from '../models';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Match } from '../../calendar/models/match.model';
import {
  Team as CoreTeam,
  Match as CoreMatch,
  Tournament,
} from '../../core/models';
import { QualifiedTeam } from '../../core/models/bracket.models';
import { BracketService as CoreBracketAlgo } from '../../core/services/bracket.service';
import {
  groupLabelFor,
  matchTitle as matchTitleHelper,
  roundBaseSingular,
} from './helpers';

@Injectable({ providedIn: 'root' })
export class BracketService {
  private matches$$ = new BehaviorSubject<BracketMatch[]>([]);
  private readonly store = inject(TournamentStore);
  private readonly core = inject(CoreBracketAlgo);
  private started = new Set<string>();
  readonly matches$ = this.matches$$.asObservable();

  getMatches$(stageId: string) {
    return this.matches$.pipe(
      map((ms) => ms.filter((m) => m.stageId === stageId))
    );
  }

  rounds$(stageId: string): Observable<number[]> {
    return this.getMatches$(stageId).pipe(
      map((ms) =>
        Array.from(new Set(ms.map((m) => m.round))).sort((a, b) => a - b)
      )
    );
  }

  roundsForSides$(
    stageId: string
  ): Observable<{ left: number[]; right: number[] }> {
    return this.rounds$(stageId).pipe(
      map((rs) => {
        const noFinal = rs.filter((r) => r > 1).sort((a, b) => a - b);
        return {
          left: [...noFinal].reverse(),
          right: noFinal,
        };
      })
    );
  }

  uiMatchById$(stageId: string): Observable<Map<string, Match>> {
    return combineLatest([this.getMatches$(stageId), this.store.teamMap$]).pipe(
      map(([ms, teamMap]) => {
        const bmById = new Map<string, BracketMatch>(ms.map((m) => [m.id, m]));
        const byId = new Map<string, Match>();
        for (const bm of ms) {
          byId.set(bm.id, this.toCardMatch(bm, teamMap, bmById));
        }
        return byId;
      })
    );
  }

  maxRound$(stageId: string): Observable<number> {
    return this.rounds$(stageId).pipe(
      map((rs) => (rs.length ? Math.max(...rs) : 0)),
      shareReplay(1)
    );
  }

  offsetMultipliers$(stageId: string): Observable<Map<number, number>> {
    return combineLatest([this.rounds$(stageId), this.maxRound$(stageId)]).pipe(
      map(([rs, max]) => {
        return new Map(
          rs.map((r) => {
            if (r <= 1) return [r, 0] as const;
            const exp = max - r - 1;
            const mult = exp >= 0 ? Math.pow(2, exp) : 0;
            return [r, mult] as const;
          })
        );
      }),
      shareReplay(1)
    );
  }

  setMatches(matches: BracketMatch[]) {
    const cloned = matches.map((m) => ({
      ...m,
      home: { ...m.home },
      away: { ...m.away },
    }));
    this.matches$$.next(cloned);
  }

  initAutoGeneration(stageId: string): void {
    if (this.started.has(stageId)) return;
    this.started.add(stageId);

    this.isGroupStageFinished$()
      .pipe(
        filter(Boolean),
        take(1),
        switchMap(() =>
          combineLatest([
            this.store.tournament$,
            this.store.matchesByStage$,
            this.store.teamMap$,
          ]).pipe(take(1))
        )
      )
      .subscribe(([tournament, matchesByStage]) => {
        const already = this.matches$$
          .getValue()
          .some((m) => m.stageId === stageId);
        if (already) return;

        const groupIds = (tournament.groups ?? []).map((g) => g.id);
        const groupsLetters = groupIds.map((_, idx) =>
          String.fromCharCode('A'.charCodeAt(0) + idx)
        );

        const standings = this.computeStandingsByGroup(
          tournament,
          matchesByStage
        );
        const qualified = this.qualifiersTop2FromStandings(
          standings,
          groupIds,
          groupsLetters
        );

        const startISO = new Date().toISOString();

        const playoffStageId = stageId;
        const matches = this.core.generatePlayoffBracketFromGroups(
          playoffStageId,
          groupsLetters,
          qualified,
          startISO,
          true
        );

        this.setMatches(matches);
      });
  }

  promoteResult(
    childId: string,
    winner: 'HOME' | 'AWAY',
    loserDestMatchId?: string
  ): void {
    const copy = this.matches$$.getValue().map((m) => ({
      ...m,
      home: { ...m.home },
      away: { ...m.away },
    }));

    const child = copy.find((m) => m.id === childId);
    if (!child) return;

    const homeTid = this.readSlotTeamId(child.home) ?? child.home.ref;
    const awayTid = this.readSlotTeamId(child.away) ?? child.away.ref;

    const winnerTid = (winner === 'HOME' ? homeTid : awayTid) as
      | string
      | undefined;
    const loserTid = (winner === 'HOME' ? awayTid : homeTid) as
      | string
      | undefined;

    if (child.parentMatchId) {
      const parent = copy.find((m) => m.id === child.parentMatchId);
      if (parent) {
        if (parent.home.type === 'WINNER' && parent.home.ref === child.id) {
          this.writeSlotTeamId(parent.home, winnerTid);
        }
        if (parent.away.type === 'WINNER' && parent.away.ref === child.id) {
          this.writeSlotTeamId(parent.away, winnerTid);
        }
      }
    }

    if (loserDestMatchId) {
      const loserMatch = copy.find((m) => m.id === loserDestMatchId);
      if (loserMatch) {
        if (
          loserMatch.home.type === 'LOSER' &&
          loserMatch.home.ref === child.id
        ) {
          this.writeSlotTeamId(loserMatch.home, loserTid);
        }
        if (
          loserMatch.away.type === 'LOSER' &&
          loserMatch.away.ref === child.id
        ) {
          this.writeSlotTeamId(loserMatch.away, loserTid);
        }
      }
    }
    this.matches$$.next(copy);
  }

  promoteWinner(childId: string, winner: 'HOME' | 'AWAY'): void {
    this.promoteResult(childId, winner);
  }

  private toCardMatch(
    bm: BracketMatch,
    teamMap: Map<string, CoreTeam>,
    bmById: Map<string, BracketMatch>
  ): Match {
    const homeTeamId = this.teamIdForUi(bm.home);
    const awayTeamId = this.teamIdForUi(bm.away);

    const [nameA, logoA] = this.nameLogoFromSlot(bm.home, teamMap, bmById);
    const [nameB, logoB] = this.nameLogoFromSlot(bm.away, teamMap, bmById);

    return {
      id: bm.id,
      homeTeamId,
      awayTeamId,
      teamA: nameA,
      teamB: nameB,
      logoA,
      logoB,
      scoreA: bm.score?.home ?? 0,
      scoreB: bm.score?.away ?? 0,
      status: bm.status as Match['status'],
      date: bm.date,
      group: groupLabelFor(bm.round, bm.index),
      details: [],
    };
  }

  private nameLogoFromSlot(
    slot: BracketTeamSlot | undefined,
    teamMap: Map<string, CoreTeam>,
    bmById: Map<string, BracketMatch>
  ): [string, string?] {
    if (!slot) {
      return ['—'];
    }

    const knownId = this.readSlotTeamId(slot);
    if (knownId) {
      const t = teamMap.get(knownId);
      return [t?.name ?? knownId, t?.logo];
    }

    switch (slot.type) {
      case 'TEAM': {
        const t = slot.ref ? teamMap.get(slot.ref) : undefined;
        return [t?.name ?? slot.ref ?? '—', t?.logo];
      }
      case 'BYE':
        return ['BYE'];

      case 'WINNER': {
        const ref = slot.ref;
        const src = ref ? bmById.get(ref) : undefined;
        if (src) {
          return [`Zwycięzca ${matchTitleHelper(src.round, src.index)}`];
        }
        return ['Zwycięzca meczu'];
      }

      case 'LOSER': {
        const ref = slot.ref;
        const src = ref ? bmById.get(ref) : undefined;
        if (src) {
          return [`Przegrany ${matchTitleHelper(src.round, src.index)}`];
        }
        return ['Przegrany meczu'];
      }
      default:
        return ['—'];
    }
  }

  private teamIdForUi(slot: BracketTeamSlot): string {
    const knownId = this.readSlotTeamId(slot);
    if (knownId) {
      return knownId;
    }

    switch (slot.type) {
      case 'TEAM':
        return slot.ref ?? '__UNKNOWN__';
      case 'BYE':
        return '__BYE__';
      case 'WINNER':
        return `__PENDING_WINNER_${slot.ref ?? ''}`;
      case 'LOSER':
        return `__PENDING_LOSER_${slot.ref ?? ''}`;
      default:
        return '__UNKNOWN__';
    }
  }

  // Odczytanie teamId z rozszerzonego slotu
  private readSlotTeamId(slot?: BracketTeamSlot): string | undefined {
    if (!slot) return undefined;
    return (slot as any).teamId as string | undefined;
  }

  // Zapisanie teamId do slotu (WINNER LUB LOSER)
  private writeSlotTeamId(slot: BracketTeamSlot, teamId?: string): void {
    if (!teamId) {
      return;
    }
    (slot as any).teamId = teamId;
  }

  private isGroupStageFinished$(): Observable<boolean> {
    return combineLatest([
      this.store.tournament$,
      this.store.matchesByStage$,
    ]).pipe(
      map(([t, matchesByStage]) =>
        this.allGroupsFinishedPerTeam(t, matchesByStage)
      )
    );
  }

  private allGroupsFinishedPerTeam(
    tournament: Tournament,
    matchesByStage: Map<string, CoreMatch[]>
  ): boolean {
    const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
    if (!groupStage) return false;

    // zgrupuj mecze etapu GROUP per groupId
    const byGroup = new Map<string, CoreMatch[]>();
    for (const m of matchesByStage.get(groupStage.id) ?? []) {
      const gid = m.groupId ?? 'UNGROUPED';
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(m);
    }

    for (const g of tournament.groups ?? []) {
      const teamIds = g.teamIds ?? [];
      const n = teamIds.length;
      if (n < 2) return false;

      // policz mecze ZAKOŃCZONE dla tej grupy
      const finished = (byGroup.get(g.id) ?? []).filter(
        (m) => m.status === 'FINISHED'
      );

      // licznik „rozegranych” per team (każdy mecz jednemu i drugiemu zespołowi liczy +1)
      const playedByTeam = new Map<string, number>(
        teamIds.map((id) => [id, 0])
      );
      for (const m of finished) {
        if (playedByTeam.has(m.homeTeamId)) {
          playedByTeam.set(
            m.homeTeamId,
            (playedByTeam.get(m.homeTeamId) || 0) + 1
          );
        }
        if (playedByTeam.has(m.awayTeamId)) {
          playedByTeam.set(
            m.awayTeamId,
            (playedByTeam.get(m.awayTeamId) || 0) + 1
          );
        }
      }

      const required = n - 1;
      for (const id of teamIds) {
        const played = playedByTeam.get(id) || 0;
        if (played < required) return false;
      }
    }

    return true;
  }

  private computeStandingsByGroup(
    tournament: Tournament,
    matchesByStage: Map<string, CoreMatch[]>
  ): Map<string, { teamId: string; pts: number; gd: number; gf: number }[]> {
    const res = new Map<
      string,
      { teamId: string; pts: number; gd: number; gf: number }[]
    >(); // <-- poprawka typu
    const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
    if (!groupStage) return res;

    const byGroup = new Map<string, CoreMatch[]>();
    for (const m of matchesByStage.get(groupStage.id) ?? []) {
      const gid = m.groupId ?? 'UNGROUPED';
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(m);
    }

    for (const g of tournament.groups ?? []) {
      const tally = new Map<
        string,
        { teamId: string; pts: number; gd: number; gf: number; ga: number }
      >();
      const ms = (byGroup.get(g.id) ?? []).filter(
        (m) => m.status === 'FINISHED'
      );

      // init
      for (const tid of g.teamIds ?? []) {
        tally.set(tid, { teamId: tid, pts: 0, gd: 0, gf: 0, ga: 0 });
      }

      for (const m of ms) {
        const a = m.homeTeamId,
          b = m.awayTeamId;
        const sh = m.score?.home ?? 0,
          sa = m.score?.away ?? 0;

        const A = tally.get(a)!;
        const B = tally.get(b)!;
        A.gf += sh;
        A.ga += sa;
        A.gd = A.gf - A.ga;
        B.gf += sa;
        B.ga += sh;
        B.gd = B.gf - B.ga;

        if (sh > sa) {
          A.pts += 3;
        } else if (sh < sa) {
          B.pts += 3;
        } else {
          A.pts += 1;
          B.pts += 1;
        }
      }

      const rows = Array.from(tally.values()).sort(this.sortRows);
      res.set(g.id, rows);
    }
    return res;
  }

  private sortRows(
    a: { pts: number; gd: number; gf: number },
    b: { pts: number; gd: number; gf: number }
  ) {
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;
    return 0;
  }

  /** TOP2 z każdej grupy, zachowując kolejność grup z turnieju; mapuje na litery A,B,C,… */
  private qualifiersTop2FromStandings(
    standings: Map<
      string,
      { teamId: string; pts: number; gd: number; gf: number }[]
    >,
    groupIds: string[],
    groupLetters: string[]
  ): QualifiedTeam[] {
    const out: QualifiedTeam[] = [];
    groupIds.forEach((gid, idx) => {
      const letter =
        groupLetters[idx] ?? String.fromCharCode('A'.charCodeAt(0) + idx);
      const rows = standings.get(gid) ?? [];
      rows.slice(0, 2).forEach((r, placeIdx) => {
        out.push({ teamId: r.teamId, group: letter, place: placeIdx + 1 });
      });
    });
    return out;
  }

  public matchTitle(round: number, index: number): string {
    return matchTitleHelper(round, index);
  }

  splitRoundForSide(
    all: BracketMatch[],
    round: number,
    side: 'left' | 'right'
  ) {
    const arr = all
      .filter((m) => m.round === round)
      .sort((a, b) => a.index - b.index);
    const half = Math.ceil(arr.length / 2);
    return side === 'left' ? arr.slice(0, half) : arr.slice(half);
  }
}
