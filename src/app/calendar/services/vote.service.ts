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
import { deepClone, positionPl, healthPl } from './helpers';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private states = new Map<MatchId, VotingState>();
  private subjects = new Map<MatchId, BehaviorSubject<VotingState>>();

  // Pobieranie aktualnego stanu głosowania dla meczu (synchron)
  getState(matchId: MatchId, seed: VotingSeed): VotingState {
    this.ensureState(matchId, seed);
    return deepClone(this.states.get(matchId)!);
  }

  // Strumień stanu głosowania dla meczu (reaktywnie przez Observable)
  getState$(matchId: MatchId, seed?: VotingSeed): Observable<VotingState> {
    if (seed) {
      this.ensureState(matchId, seed);
    }
    const subj = this.getSubject(matchId);
    return subj.asObservable();
  }

  // Inicjalizacja stanu (idempotentnie), wywołuje ensureState
  init(matchId: MatchId, seed: VotingSeed): void {
    this.ensureState(matchId, seed);
  }

  // Strumień stanu głosowania dla wskazanego meczu
  selectState$(matchId: MatchId): Observable<VotingState> {
    const subj = this.getSubject(matchId);
    return subj.asObservable();
  }

  // Oddanie glosu na zawodnika meczu
  vote(matchId: MatchId, playerId: PlayerId): VotingState {
    const state = this.states.get(matchId);
    if (!state) {
      throw new Error('Voting state not initialized');
    }
    if (state.status !== 'OPEN') {
      return deepClone(state);
    }
    if (state.hasVoted) {
      return deepClone(state);
    }

    const entry = state.summary.find((x) => x.playerId === playerId);
    if (entry) {
      entry.votes += 1;
    } else {
      state.summary.push({ playerId, votes: 1 });
    }

    state.hasVoted = true;
    this.markHasVoted(matchId, true);

    this.push(matchId, state);
    return deepClone(state);
  }

  // Zmiana statusu głosowania (np. ręczne zamknięcie)
  setStatus(matchId: MatchId, status: VotingStatus): VotingState {
    const state = this.states.get(matchId);
    if (!state) {
      throw new Error('Voting state not initialized');
    }
    state.status = status;
    this.push(matchId, state);
    return deepClone(state);
  }

  // Mapowanie kandydatów do modelu widoku UiPlayer
  getUiCandidates(
    matchId: MatchId,
    shirtNumberByPlayer?: Map<string, number>
  ): UiPlayer[] {
    const state = this.states.get(matchId);
    if (!state) return [];
    return state.candidates.map((c) => ({
      name: c.name,
      position: positionPl(c.position),
      shirtNumber: shirtNumberByPlayer?.get(c.playerId) ?? 0,
      healthStatus: healthPl(c.healthStatus),
    }));
  }

  // Upewnienie się, że istnieje stan głosowania dla meczu, jeśli nie, stworzenie go
  private ensureState(matchId: MatchId, seed: VotingSeed): void {
    const existing = this.states.get(matchId);
    const healthy = seed.candidates.filter((c) => c.healthStatus === 'HEALTHY');

    if (!existing || (existing.candidates?.length ?? 0) === 0) {
      const next: VotingState = {
        matchId,
        status: seed.status,
        hasVoted: this.readHasVoted(matchId),
        candidates: healthy,
        summary: deepClone(seed.summary ?? []),
        closesPolicy: seed.closesPolicy,
        closesAtISO: seed.closesAtISO,
      };

      this.states.set(matchId, next);

      const subj = this.subjects.get(matchId);
      if (subj) {
        subj.next(deepClone(next));
      } else {
        this.subjects.set(
          matchId,
          new BehaviorSubject<VotingState>(deepClone(next))
        );
      }
      return;
    }
  }

  // Pobieranie BehaviorSubject dla meczu (tworzy pusty jeśli brak)
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

  // Zaktualizowanie stanu i wypchnięcie go do obserwatorów
  private push(matchId: MatchId, state: VotingState) {
    this.states.set(matchId, state);
    const subj = this.getSubject(matchId);
    subj.next(deepClone(state));
  }

  // Odczytanie z localStorage czy użytkownik już głosował
  private readHasVoted(matchId: MatchId): boolean {
    try {
      return localStorage.getItem(this.lsKey(matchId)) === '1';
    } catch {
      return false;
    }
  }

  // Zapisanie w localStorage, że użytkownik zagłosował
  private markHasVoted(matchId: MatchId, v: boolean) {
    try {
      localStorage.setItem(this.lsKey(matchId), v ? '1' : '0');
    } catch {}
  }

  // Klucz dla localStorage do przechowywania flagi "hasVoted"
  private lsKey(matchId: MatchId) {
    return `mvp:hasVoted:${matchId}`;
  }

  // Budowanie seeda głosowania dla meczu na podstawie eventów i składów
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
    lineups?: {
      homeGKIds?: string[];
      awayGKIds?: string[];
    };
  }): VotingSeed {
    const {
      matchId,
      status,
      homeTeamId,
      awayTeamId,
      events = [],
      teamMap,
      playerMap,
      lineups,
    } = args;

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
      if (!evByPlayer.has(ev.playerId)) {
        evByPlayer.set(ev.playerId, {});
      }
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
          if (ev.card === 'RED') {
            s.red = (s.red ?? 0) + 1;
          } else if (ev.card === 'SECOND_YELLOW') {
            s.yellow = (s.yellow ?? 0) + 1;
          } else {
            s.yellow = (s.yellow ?? 0) + 1;
          }
          break;
      }
    }

    const candidates: VotingCandidate[] = [];

    const pushTeam = (teamId: string) => {
      const team = teamMap.get(teamId);
      if (!team) {
        return;
      }

      const teamPlayerIds =
        Array.isArray(team.playerIds) && team.playerIds.length > 0
          ? team.playerIds
          : [...playerMap.values()]
              .filter((p) => p.teamId === teamId)
              .map((p) => p.id);

      const gkPlayedIds =
        teamId === homeTeamId
          ? lineups?.homeGKIds ?? []
          : lineups?.awayGKIds ?? [];

      for (const pid of teamPlayerIds) {
        const p = playerMap.get(pid);
        if (!p) {
          continue;
        }
        if (p.healthStatus !== 'HEALTHY') {
          continue;
        }

        const isGK = p.position === 'GK';
        const playedAsGK = isGK && gkPlayedIds.includes(p.id);

        candidates.push({
          playerId: p.id,
          teamId: p.teamId,
          name: p.name,
          position: p.position,
          healthStatus: p.healthStatus,
          shirtNumber: p.shirtNumber,
          events: evByPlayer.get(p.id),
          isGoalkeeper: isGK,
          playedAsGK,
        });
      }
    };

    pushTeam(homeTeamId);
    pushTeam(awayTeamId);

    return {
      matchId,
      status,
      candidates,
      summary: [],
    };
  }
}
