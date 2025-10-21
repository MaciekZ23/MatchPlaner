import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  shareReplay,
  take,
} from 'rxjs';
import { BracketMatch, BracketTeamSlot } from '../models';
import { TournamentStore } from '../../core/services/tournament-store.service';
import { Match } from '../../calendar/models/match.model';
import {
  Team as CoreTeam,
  Match as CoreMatch,
  Player as CorePlayer,
} from '../../core/models';
import { matchTitle as matchTitleHelper } from './helpers';
import { IPlayoffsApi, PLAYOFFS_API } from '../../core/api/playoffs.api';
import { HttpPlayoffsApi } from '../../core/api/http-playoffs.api';
import { GeneratePlayoffsPayload } from '../../core/models/playoffs.models';

@Injectable({ providedIn: 'root' })
export class PlayoffsBracketService {
  private matches$$ = new BehaviorSubject<BracketMatch[]>([]);
  readonly matches$ = this.matches$$.asObservable();
  private generating$$ = new BehaviorSubject<boolean>(false);
  readonly generating$ = this.generating$$.asObservable();

  private readonly store = inject(TournamentStore);
  private readonly api =
    inject<IPlayoffsApi>(PLAYOFFS_API, { optional: true }) ??
    inject(HttpPlayoffsApi);

  loadByTournament(): void {
    this.store.tournament$.pipe(take(1)).subscribe((t) => {
      if (!t?.id) {
        return;
      }
      this.api.getBracketByTournament(t.id).subscribe({
        next: (arr) => {
          this.setMatches(arr.map(this.mapApiMatchToBracket));
        },
        error: (err) => {
          console.error('Playoffs load error', err);
          this.setMatches([]);
        },
      });
    });
  }

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
        return { left: [...noFinal].reverse(), right: noFinal };
      })
    );
  }

  uiMatchById$(stageId: string): Observable<Map<string, Match>> {
    return combineLatest([
      this.getMatches$(stageId),
      this.store.teamMap$,
      this.store.playerMap$,
    ]).pipe(
      map(([ms, teamMap, playerMap]) => {
        const bmById = new Map<string, BracketMatch>(ms.map((m) => [m.id, m]));
        const byId = new Map<string, Match>();
        for (const bm of ms) {
          byId.set(bm.id, this.toCardMatch(bm, teamMap, bmById, playerMap));
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
            if (r <= 1) {
              return [r, 0] as const;
            }
            const exp = max - r - 1;
            const mult = exp >= 0 ? Math.pow(2, exp) : 0;
            return [r, mult] as const;
          })
        );
      }),
      shareReplay(1)
    );
  }

  hasBracketForStage$(stageId: string): Observable<boolean> {
    return this.getMatches$(stageId).pipe(
      map((ms) => ms.length > 0),
      shareReplay(1)
    );
  }

  private setMatches(matches: BracketMatch[]) {
    const cloned = matches.map((m) => {
      return {
        ...m,
        home: { ...m.home },
        away: { ...m.away },
      };
    });
    this.matches$$.next(cloned);
  }

  private mapApiMatchToBracket(m: CoreMatch): BracketMatch {
    const toSlot = (
      teamId: string | null,
      srcKind: 'TEAM' | 'WINNER' | 'LOSER' | null,
      srcRef: string | null
    ): BracketTeamSlot => {
      if (teamId) {
        return { type: 'TEAM', ref: teamId, teamId };
      }
      if (srcKind === 'WINNER') {
        return { type: 'WINNER', ref: srcRef ?? undefined };
      }
      if (srcKind === 'LOSER') {
        return { type: 'LOSER', ref: srcRef ?? undefined };
      }
      return { type: 'TEAM', ref: undefined };
    };

    const { homeSourceKind, homeSourceRef, awaySourceKind, awaySourceRef } =
      m as any;

    const homeScore = (m as any).homeScore as number | null | undefined;
    const awayScore = (m as any).awayScore as number | null | undefined;
    const hasScore = homeScore != null && awayScore != null;

    return {
      id: m.id,
      stageId: m.stageId,
      round: (m.round ?? 0) || 0,
      index: (m.index ?? 0) || 0,
      date: m.date,
      status: m.status as any,
      home: toSlot(
        m.homeTeamId ?? null,
        homeSourceKind ?? null,
        homeSourceRef ?? null
      ),
      away: toSlot(
        m.awayTeamId ?? null,
        awaySourceKind ?? null,
        awaySourceRef ?? null
      ),
      score: hasScore ? { home: homeScore!, away: awayScore! } : undefined,
      events: (m as any).events ?? [],
    };
  }

  private toCardMatch(
    bm: BracketMatch,
    teamMap: Map<string, CoreTeam>,
    bmById: Map<string, BracketMatch>,
    playerMap: Map<string, CorePlayer>
  ): Match {
    const [nameA, logoA] = this.nameLogoFromSlot(bm.home, teamMap, bmById);
    const [nameB, logoB] = this.nameLogoFromSlot(bm.away, teamMap, bmById);

    // ⬇️ policz szczegóły do timeline (tak jak w Calendar)
    const details = this.detailsFromEvents(bm, playerMap);

    return {
      id: bm.id,
      stageId: bm.stageId,
      groupId: matchTitleHelper(bm.round, bm.index),
      round: bm.round,
      index: bm.index,
      date: bm.date,
      status: bm.status as Match['status'],
      homeTeamId: this.teamIdForUi(bm.home),
      awayTeamId: this.teamIdForUi(bm.away),

      ...(() => {
        const h = this.slotSourceFromSlot(bm.home);
        const a = this.slotSourceFromSlot(bm.away);
        return {
          homeSourceKind: h.kind,
          homeSourceRef: h.ref,
          awaySourceKind: a.kind,
          awaySourceRef: a.ref,
        };
      })(),

      score: bm.score
        ? { home: bm.score.home, away: bm.score.away }
        : undefined,
      events: (bm as any).events ?? [],
      lineups: undefined,

      teamA: nameA,
      teamB: nameB,
      logoA,
      logoB,
      scoreA: bm.score?.home ?? 0,
      scoreB: bm.score?.away ?? 0,
      details,
    };
  }

  private detailsFromEvents(
    bm: BracketMatch,
    playerMap: Map<string, CorePlayer>
  ) {
    const events = (bm.events ?? [])
      .slice()
      .sort((a: any, b: any) => a.minute - b.minute);

    // realne teamId ze slotów (TEAM -> teamId/ref; WINNER/LOSER -> ref do meczu poprzedniego – timeline i tak pokaże po teamId eventu)
    const homeId = (bm.home as any).teamId ?? bm.home?.ref ?? null;
    const awayId = (bm.away as any).teamId ?? bm.away?.ref ?? null;

    let liveA = 0;
    let liveB = 0;
    const details: any[] = [];

    for (const ev of events) {
      const playerName = playerMap.get(ev.playerId)?.name ?? ev.playerId;
      const isHome = homeId && ev.teamId === homeId;
      const teamSide: 'A' | 'B' = isHome ? 'A' : 'B';

      switch (ev.type) {
        case 'GOAL': {
          if (isHome) liveA++;
          else liveB++;
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: teamSide,
            event: 'GOAL',
          });
          break;
        }
        case 'OWN_GOAL': {
          const scoringSide: 'A' | 'B' = isHome ? 'B' : 'A';
          if (isHome) liveB++;
          else liveA++;
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: scoringSide,
            event: 'OWN_GOAL',
          });
          break;
        }
        case 'CARD': {
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: teamSide,
            event: 'CARD',
            card: ev.card,
          });
          break;
        }
        case 'ASSIST': {
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: teamSide,
            event: 'ASSIST',
          });
          break;
        }
        default:
          break;
      }
    }

    return details;
  }

  private slotSourceFromSlot(slot?: BracketTeamSlot): {
    kind: 'TEAM' | 'WINNER' | 'LOSER' | null;
    ref: string | null;
  } {
    if (!slot) return { kind: null, ref: null };

    const knownId = (slot as any).teamId as string | undefined;
    if (knownId) {
      return { kind: 'TEAM', ref: knownId };
    }

    switch (slot.type) {
      case 'TEAM':
        return { kind: 'TEAM', ref: slot.ref ?? null };
      case 'WINNER':
        return { kind: 'WINNER', ref: slot.ref ?? null };
      case 'LOSER':
        return { kind: 'LOSER', ref: slot.ref ?? null };
      default:
        return { kind: null, ref: null };
    }
  }

  private nameLogoFromSlot(
    slot: BracketTeamSlot | undefined,
    teamMap: Map<string, CoreTeam>,
    bmById: Map<string, BracketMatch>
  ): [string, string?] {
    if (!slot) {
      return ['—'];
    }

    const knownId = (slot as any).teamId as string | undefined;
    if (knownId) {
      const t = teamMap.get(knownId);
      return [t?.name ?? knownId, t?.logo];
    }

    switch (slot.type) {
      case 'TEAM': {
        const t = slot.ref ? teamMap.get(slot.ref) : undefined;
        return [t?.name ?? slot.ref ?? '—', t?.logo];
      }
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
      default: {
        return ['—'];
      }
    }
  }

  private teamIdForUi(slot: BracketTeamSlot): string {
    const knownId = (slot as any).teamId as string | undefined;
    if (knownId) {
      return knownId;
    }

    switch (slot.type) {
      case 'TEAM': {
        return slot.ref ?? '__UNKNOWN__';
      }
      case 'WINNER': {
        return `__PENDING_WINNER_${slot.ref ?? ''}`;
      }
      case 'LOSER': {
        return `__PENDING_LOSER_${slot.ref ?? ''}`;
      }
      default: {
        return '__UNKNOWN__';
      }
    }
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
    if (side === 'left') {
      return arr.slice(0, half);
    } else {
      return arr.slice(half);
    }
  }

  generateForCurrentTournament(
    options?: Partial<GeneratePlayoffsPayload>
  ): void {
    this.store.tournament$.pipe(take(1)).subscribe((t) => {
      if (!t?.id) {
        console.error('Brak aktywnego turnieju – nie generuję drabinki.');
        return;
      }
      const payload = { ...(options ?? {}) } as GeneratePlayoffsPayload;

      this.generating$$.next(true);
      this.api.generate(t.id, payload).subscribe({
        next: () => this.loadByTournament(),
        error: (err) => console.error('Playoffs generate error', err),
        complete: () => this.generating$$.next(false),
      });
    });
  }
}
