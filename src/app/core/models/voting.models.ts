import { Position, HealthStatus } from '../types';
import {
  MatchId,
  TeamId,
  PlayerId,
  VotingStatus,
  VotingClosePolicy,
} from '../types';

// Statystyki każdego kandydata
export interface PlayerEventStats {
  goals?: number;
  assists?: number;
  yellow?: number;
  red?: number;
  ownGoals?: number;
}

// Kandydat do MVP
export interface VotingCandidate {
  playerId: PlayerId;
  teamId: TeamId;
  name: string;
  position: Position;
  healthStatus: HealthStatus;
  events?: PlayerEventStats;
  shirtNumber?: number;
  isGoalkeeper?: boolean;
  playedAsGK?: boolean;
}

// Podsumowanie głosów dla każdego zawodnika
export interface VoteSummaryEntry {
  playerId: PlayerId;
  votes: number;
}

// Stan głosowania dla konkretnego meczu
export interface VotingState {
  matchId: MatchId;
  status: VotingStatus;
  hasVoted: boolean;
  candidates: VotingCandidate[];
  summary: VoteSummaryEntry[];
  closesPolicy?: VotingClosePolicy;
  closesAtISO?: string;
}

// Dane poczatkowe stanu głosowania dla danego meczu
export interface VotingSeed {
  matchId: MatchId;
  status: VotingStatus;
  candidates: VotingCandidate[];
  summary: VoteSummaryEntry[];
  closesPolicy?: VotingClosePolicy;
  closesAtISO?: string;
}

// Payload oddania głosu
export interface VoteRequest {
  matchId: MatchId;
  playerId: PlayerId;
}

// Odpowiedź po oddaniu głosu
export interface VoteResponse {
  ok: true;
  matchId: MatchId;
  playerId: PlayerId;
}

// Wynik po zamknięciu głosowania
export interface MVPAward {
  matchId: MatchId;
  winners: PlayerId[];
  summary: VoteSummaryEntry[];
}
