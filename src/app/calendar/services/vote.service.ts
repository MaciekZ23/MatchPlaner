import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { PlayerId, MatchId, VotingStatus } from '../../core/types';
import { VotingState, VoteResponse } from '../../core/models';
import { IVotingApi, VOTING_API } from '../../core/api/voting.api';

@Injectable({ providedIn: 'root' })
export class VoteService {
  constructor(@Inject(VOTING_API) private api: IVotingApi) {}
  private subjects = new Map<MatchId, BehaviorSubject<VotingState>>();
  private timers = new Map<MatchId, any>();

  /** Strumień stanu głosowania (BehaviorSubject w Observable) */
  selectState$(matchId: MatchId): Observable<VotingState> {
    return this.ensureSubject(matchId).asObservable();
  }

  /** Pobieranie stanu głosowania z backendu i aktualizacja store */
  fetchState(matchId: MatchId): void {
    this.api
      .getState(matchId)
      .pipe(
        tap((state) => {
          this.push(matchId, state);
          this.scheduleAutoClose(matchId, state.closesAtISO);
        }),
        catchError((e) => {
          console.error('GET /voting/:id error', e);
          return throwError(() => e);
        })
      )
      .subscribe();
  }

  /** Oddawanie głosu */
  vote(matchId: MatchId, playerId: PlayerId): void {
    this.api
      .vote(matchId, playerId)
      .pipe(
        tap((_res: VoteResponse) => {
          const curr = this.ensureSubject(matchId).value;
          if (curr.hasVoted) return;
          const next: VotingState = {
            ...curr,
            hasVoted: true,
            summary: bumpSummary(curr.summary, playerId),
          };
          this.push(matchId, next);
        }),
        catchError((e) => {
          if (e?.status === 409) {
            const curr = this.ensureSubject(matchId).value;
            this.push(matchId, { ...curr, hasVoted: true });
          } else {
            console.error('POST /voting/vote error', e);
          }
          return throwError(() => e);
        })
      )
      .subscribe();
  }

  /** Ustawienie statusu głosowania na backendzie przez admina */
  setStatus(matchId: MatchId, status: VotingStatus): void {
    this.api
      .setStatus(matchId, status)
      .pipe(
        tap(() => {
          const curr = this.ensureSubject(matchId).value;
          this.push(matchId, { ...curr, status });
        }),
        catchError((e) => {
          console.error('PATCH /voting/status error', e);
          return throwError(() => e);
        })
      )
      .subscribe();
  }

  /** Zapewnienie istnienia BehaviorSubject dla meczu */
  private ensureSubject(matchId: MatchId): BehaviorSubject<VotingState> {
    let subj = this.subjects.get(matchId);
    if (!subj) {
      const empty: VotingState = {
        matchId,
        status: 'NOT_STARTED',
        hasVoted: false,
        candidates: [],
        summary: [],
      };
      subj = new BehaviorSubject<VotingState>(empty);
      this.subjects.set(matchId, subj);
    }
    return subj;
  }

  /** Wysłanie stanu do obserwujących (z deep clone dla bezpieczeństwa referencji) */
  private push(matchId: MatchId, state: VotingState) {
    this.ensureSubject(matchId).next(structuredClone(state));
  }

  /** Automatyczne zamknięcie głosowania po czasie wskazanym w backendzie */
  private scheduleAutoClose(matchId: MatchId, closesAtISO?: string) {
    if (!closesAtISO) return;

    const msLeft = new Date(closesAtISO).getTime() - Date.now();
    const existing = this.timers.get(matchId);
    if (existing) clearTimeout(existing);

    if (msLeft <= 0) {
      const s = this.ensureSubject(matchId).value;
      if (s.status !== 'CLOSED') this.push(matchId, { ...s, status: 'CLOSED' });
      return;
    }

    const id = setTimeout(() => {
      const s = this.ensureSubject(matchId).value;
      if (s.status !== 'CLOSED') this.push(matchId, { ...s, status: 'CLOSED' });
      this.timers.delete(matchId);
    }, msLeft);

    this.timers.set(matchId, id);
  }
}

/** Podbijanie liczby głosów dla konkretnego zawodnika */
function bumpSummary(
  summary: VotingState['summary'],
  playerId: PlayerId
): VotingState['summary'] {
  const copy = summary.map((x) => ({ ...x }));
  const idx = copy.findIndex((x) => x.playerId === playerId);
  if (idx >= 0) {
    copy[idx].votes += 1;
  } else {
    copy.push({ playerId, votes: 1 });
  }
  return copy;
}
