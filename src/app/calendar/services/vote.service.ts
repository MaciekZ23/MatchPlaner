import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  PlayerId,
  MatchId,
  VotingStatus,
  Position,
  HealthStatus,
} from '../../core/types';
import { VotingState, VotingSeed, VotingCandidate } from '../../core/models';
import { Player as UiPlayer } from '../../teams/models/team';

@Injectable({ providedIn: 'root' })
export class VoteService {
  /** Pamięć stanów meczów (w RAM) */
  private states = new Map<MatchId, VotingState>();
  /** Strumienie obserwowalne dla poszczególnych meczów */
  private subjects = new Map<MatchId, BehaviorSubject<VotingState>>();

  // ====== Public API ======

  /** Zainicjalizuj/odczytaj stan głosowania dla meczu */
  getState(matchId: MatchId, seed: VotingSeed): VotingState {
    this.ensureState(matchId, seed);
    return this.clone(this.states.get(matchId)!);
  }

  /** Wersja reaktywna: subskrybuj zmiany stanu głosowania dla meczu */
  getState$(matchId: MatchId, seed?: VotingSeed): Observable<VotingState> {
    if (seed) this.ensureState(matchId, seed);
    const subj = this.getSubject(matchId);
    return subj.asObservable();
  }

  /** Oddanie głosu na danego zawodnika */
  vote(matchId: MatchId, playerId: PlayerId): VotingState {
    const state = this.states.get(matchId);
    if (!state) throw new Error('Voting state not initialized');
    if (state.status !== 'OPEN') return this.clone(state);
    if (state.hasVoted) return this.clone(state);

    const entry = state.summary.find((x) => x.playerId === playerId);
    if (entry) entry.votes += 1;
    else state.summary.push({ playerId, votes: 1 });

    state.hasVoted = true;
    this.markHasVoted(matchId, true);

    this.push(matchId, state);
    return this.clone(state);
  }

  /** Zmiana statusu głosowania (np. ręczne zamknięcie) */
  setStatus(matchId: MatchId, status: VotingStatus): VotingState {
    const state = this.states.get(matchId);
    if (!state) throw new Error('Voting state not initialized');
    state.status = status;
    this.push(matchId, state);
    return this.clone(state);
  }

  /** (Opcjonalnie) Wyczyszczenie lokalnego "hasVoted" */
  resetVoteFlag(matchId: MatchId): void {
    try {
      localStorage.removeItem(this.lsKey(matchId));
    } catch {}
    const state = this.states.get(matchId);
    if (state) {
      state.hasVoted = false;
      this.push(matchId, state);
    }
  }

  // ====== UI helpers (mapowanie do widoku) ======

  /** Zwraca kandydatów w formacie UI (po polsku), na podstawie aktualnego stanu. */
  getUiCandidates(
    matchId: MatchId,
    shirtNumberByPlayer?: Map<string, number>
  ): UiPlayer[] {
    const state = this.states.get(matchId);
    if (!state) return [];
    return state.candidates.map((c) =>
      this.mapCandidateToUi(c, shirtNumberByPlayer)
    );
  }

  /** Mapowanie pojedynczego kandydata do formatu UI (tak jak w teams) */
  mapCandidateToUi(
    c: VotingCandidate,
    shirtNumberByPlayer?: Map<string, number>
  ): UiPlayer {
    return {
      name: c.name,
      position: this.positionPl(c.position),
      shirtNumber: shirtNumberByPlayer?.get(c.playerId) ?? 0,
      healthStatus: this.healthPl(c.healthStatus),
    };
  }

  // ====== Internal helpers ======

  private ensureState(matchId: MatchId, seed: VotingSeed): void {
    if (this.states.has(matchId)) return;

    // tylko HEALTHY kandydaci (na froncie możesz dodatkowo przefiltrować)
    const candidates = seed.candidates.filter(
      (c) => c.healthStatus === 'HEALTHY'
    );

    const init: VotingState = {
      matchId,
      status: seed.status,
      hasVoted: this.readHasVoted(matchId),
      candidates, // <-- pozostawiamy position jako enum (Position) w modelu CORE
      summary: this.clone(seed.summary ?? []),
      closesPolicy: seed.closesPolicy,
      closesAtISO: seed.closesAtISO,
    };

    this.states.set(matchId, init);
    this.subjects.set(
      matchId,
      new BehaviorSubject<VotingState>(this.clone(init))
    );
  }

  private getSubject(matchId: MatchId): BehaviorSubject<VotingState> {
    const subj = this.subjects.get(matchId);
    if (!subj) {
      const empty: VotingState = {
        matchId,
        status: 'NOT_STARTED',
        hasVoted: false,
        candidates: [],
        summary: [],
      };
      const b = new BehaviorSubject<VotingState>(empty);
      this.subjects.set(matchId, b);
      this.states.set(matchId, empty);
      return b;
    }
    return subj;
  }

  private push(matchId: MatchId, state: VotingState) {
    this.states.set(matchId, state);
    const subj = this.getSubject(matchId);
    subj.next(this.clone(state));
  }

  private readHasVoted(matchId: MatchId): boolean {
    try {
      return localStorage.getItem(this.lsKey(matchId)) === '1';
    } catch {
      return false;
    }
  }

  private markHasVoted(matchId: MatchId, v: boolean) {
    try {
      localStorage.setItem(this.lsKey(matchId), v ? '1' : '0');
    } catch {}
  }

  private lsKey(matchId: MatchId) {
    return `mvp:hasVoted:${matchId}`;
  }

  private clone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
  }

  private positionPl(pos: Position): string {
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
        return 'Nieznana pozycja';
    }
  }

  private healthPl(h: HealthStatus): 'Zdrowy' | 'Kontuzjowany' {
    return h === 'HEALTHY' ? 'Zdrowy' : 'Kontuzjowany';
  }

  // ====== Budowanie seeda z całych składów i eventów ======

  buildSeedForMatch(args: {
    matchId: MatchId;
    status: VotingStatus;
    homeTeamId: string;
    awayTeamId: string;
    events?: Array<{
      playerId: string;
      type: 'GOAL' | 'OWN_GOAL' | 'ASSIST' | 'CARD';
      card?: 'YELLOW' | 'SECOND_YELLOW' | 'RED';
    }>;
    teamMap: Map<string, { id: string; name: string; playerIds: string[] }>;
    playerMap: Map<
      string,
      {
        id: string;
        teamId: string;
        name: string;
        position: Position;
        healthStatus: HealthStatus;
        shirtNumber?: number;
      }
    >;
  }): VotingSeed {
    const {
      matchId,
      status,
      homeTeamId,
      awayTeamId,
      events = [],
      teamMap,
      playerMap,
    } = args;

    // policz eventy per zawodnik
    const evByPlayer = new Map<
      string,
      {
        goals?: number;
        assists?: number;
        yellow?: number;
        red?: number;
        ownGoals?: number;
      }
    >();

    for (const ev of events) {
      if (!evByPlayer.has(ev.playerId)) evByPlayer.set(ev.playerId, {});
      const s = evByPlayer.get(ev.playerId)!;
      switch (ev.type) {
        case 'GOAL':
          s.goals = (s.goals ?? 0) + 1;
          break;
        case 'ASSIST':
          s.assists = (s.assists ?? 0) + 1;
          break;
        case 'OWN_GOAL':
          s.ownGoals = (s.ownGoals ?? 0) + 1;
          break;
        case 'CARD':
          if (ev.card === 'RED') s.red = (s.red ?? 0) + 1;
          else s.yellow = (s.yellow ?? 0) + 1;
          break;
      }
    }

    // kandydaci: HEALTHY z obu drużyn
    const candidates: VotingCandidate[] = [];
    const pushTeam = (teamId: string) => {
      const team = teamMap.get(teamId);
      if (!team) return;
      for (const pid of team.playerIds ?? []) {
        const p = playerMap.get(pid);
        if (!p) continue;
        if (p.healthStatus !== 'HEALTHY') continue;

        candidates.push({
          playerId: p.id,
          teamId: p.teamId,
          name: p.name,
          position: p.position, // <-- zostawiamy enum Position (bez tłumaczenia!)
          healthStatus: p.healthStatus,
          events: evByPlayer.get(p.id),
        });
      }
    };
    pushTeam(homeTeamId);
    pushTeam(awayTeamId);

    // sortowanie: najpierw aktywni w meczu, potem alfabetycznie
    candidates.sort((a, b) => {
      const wa =
        (a.events?.goals ?? 0) +
        (a.events?.assists ?? 0) +
        (a.events?.yellow ?? 0) +
        (a.events?.red ?? 0) +
        (a.events?.ownGoals ?? 0);
      const wb =
        (b.events?.goals ?? 0) +
        (b.events?.assists ?? 0) +
        (b.events?.yellow ?? 0) +
        (b.events?.red ?? 0) +
        (b.events?.ownGoals ?? 0);
      if (wa !== wb) return wb - wa;
      return a.name.localeCompare(b.name, 'pl');
    });

    return {
      matchId,
      status,
      candidates,
      summary: [],
    };
  }
}
