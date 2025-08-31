export type MatchId = string;
export type TeamId = string;
export type PlayerId = string;

export type VotingStatus = 'NOT_STARTED' | 'OPEN' | 'CLOSED';

export type VotingClosePolicy =
  | { type: 'ABSOLUTE_DEADLINE'; closesAtISO: string } // Zamknięcie o wskazanej porze
  | { type: 'NEXT_ROUND_START' } // Zamknięcie przed startem kolejnej kolejki
  | { type: 'MANUAL' };

export type MatchDetailsActiveTab = 'DETAILS' | 'MVP';
